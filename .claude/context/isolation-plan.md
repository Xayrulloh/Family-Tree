# Isolation Ticket — Implementation Plan

> Goal: stop deciding owner/public/shared access in three different places. Encode the
> **access mode in the route prefix**, enforce it with **Guards**, keep **services pure**,
> and collapse the **~95% duplicated frontend pages** into shared components.

## Decisions (locked)
- **Public** gets a dedicated prefix: `/family-trees/:id/public/...` (PublicGuard, no JWT, read-only).
- **Owner** stays at the bare path `/family-trees/:id` (no `/private` prefix — no breaking change).
- **Shared** uses `/family-trees/:id/shared/...` (SharedAccessGuard + RBAC).
- Services are **not** touched for access logic — they remain pure, keyed by `familyTreeId`.

## Final route map
```
OWNER     /family-trees/:id                              (JWTAuthGuard + OwnerGuard)
          /family-trees/:familyTreeId/members/**         read + write
          /family-trees/:familyTreeId/members/connections

PUBLIC    /family-trees/:id/public                       (PublicGuard, no JWT, READ-ONLY)
          /family-trees/:familyTreeId/public/members     read only
          /family-trees/:familyTreeId/public/members/connections

SHARED    /family-trees/:id/shared                       (JWTAuthGuard + SharedAccessGuard)
          /family-trees/:familyTreeId/shared/members/**  read + write (RBAC-gated)
          /family-trees/:familyTreeId/shared/members/connections
```

---

## Current problems being fixed
1. Access mode decided 3 ways: inline `if` in `family-tree.controller` (`GET /:id`), `WHERE createdBy = userId` inside the service (PUT/DELETE), and the god-method `checkAccessSharedFamilyTree(userId, treeId, perms?)` for members/connections.
2. `checkAccessSharedFamilyTree` branches owner→public→shared in one method — the thing we want to split.
3. **Security hole**: `GET /family-trees/:familyTreeId/members/:memberUserId/connections` has NO access check (family-tree-member-connection.controller.ts).
4. Debug log `console.log('what the fuck')` in shared-family-tree.service.ts (~line 280).
5. Frontend `trees-detail` vs `shared-trees-detail` ≈ 95% copy-paste; differ only in (a) which API fetches the tree, (b) how permissions are derived.

---

## PHASE 1 — Backend access layer (guards replace branching)

### New: `@RequirePermission()` decorator
- Metadata key e.g. `REQUIRED_PERMISSION`. Value ∈ `'canAddMembers' | 'canEditMembers' | 'canDeleteMembers'`.
- Set with `Reflector` / `SetMetadata`.

### New guards (in `modules/common/guards/` or shared-family-tree module)
- **`OwnerGuard`** — load tree by `familyTreeId`/`id`; assert `tree.createdBy === req.user.id`; 404 if missing, 403 otherwise. Stash tree on `req` to avoid re-fetch.
- **`PublicGuard`** — load tree; assert `tree.isPublic === true`; else 403/404. No JWT dependency.
- **`SharedAccessGuard`** — load shared record for (`familyTreeId`, `userId`); 403 if missing or `isBlocked`; read `@RequirePermission` metadata via `Reflector` and assert the matching flag is true. (No metadata = read-only access, allowed.)

### Decompose `checkAccessSharedFamilyTree`
- Delete the method; move owner-bypass/public/shared logic into the three guards.
- Keep the shared-family-tree **service** data methods: `getSharedFamilyTrees`, `getSharedFamilyTreeById`, `getSharedFamilyTreeUsersById`, `updateSharedFamilyTreeById`, `createSharedFamilyTree`.

### Fixes folded in
- Add a guard to the previously-unguarded `members/:memberUserId/connections` route.
- Remove the `console.log('what the fuck')` debug line.

### Acceptance
- Owner can do everything on bare path; shared user gated by RBAC flags; public user (even unauthenticated) can only read; blocked shared user gets 403 everywhere.

---

## PHASE 2 — Backend route isolation (DRY controllers)

### Abstract base controllers (handler bodies written ONCE)
Split read tier vs write tier so public can't inherit writes:

```ts
abstract class BaseMemberReadController {           // GET only
  @Get()              getAll()
  @Get('connections') connections()                 // from connection controller, merged here logically
  @Get(':id')         getOne()
}
abstract class BaseMemberWriteController extends BaseMemberReadController {
  @RequirePermission('canAddMembers')    @Post('child')   child()
  @RequirePermission('canAddMembers')    @Post('spouse')  spouse()
  @RequirePermission('canAddMembers')    @Post('parents') parents()
  @RequirePermission('canEditMembers')   @Put(':id')      update()
  @RequirePermission('canDeleteMembers') @Delete(':id')   remove()
}
```

### Concrete controllers — differ ONLY in prefix + guards
```ts
@Controller('family-trees/:familyTreeId/members')        @UseGuards(JWTAuthGuard, OwnerGuard)
class OwnerMemberController  extends BaseMemberWriteController {}

@Controller('family-trees/:familyTreeId/shared/members') @UseGuards(JWTAuthGuard, SharedAccessGuard)
class SharedMemberController extends BaseMemberWriteController {}

@Controller('family-trees/:familyTreeId/public/members')  // read-only tier
class PublicMemberController extends BaseMemberReadController {}
```
Apply the same pattern to the family-tree root controller (owner/public/shared `GET /:id`) and connections.
Register all concrete controllers in their modules.

### Route ordering caution
`/shared` and `/public` are literal segments under `/family-trees/:id/...`. Ensure the shared-family-tree controller's `GET /family-trees/shared` (list) and `:familyTreeId/shared` don't collide with the new prefixes — verify NestJS route matching order; literal segments win over params, but test `shared` list vs `:id/shared`.

### Caching — confirmed NON-breaking
- Keys are **data-scoped, not access-scoped**: `family-trees:${treeId}:members` and `...:members:connections` (keyed only by `treeId`). All three modes correctly share one cache entry.
- **Only change**: broaden path matching in `family-tree.cache.interceptor.ts` so `/public/members` and `/shared/members` resolve to the same `treeId`-based key. No new invalidation logic.
- List cache `users:${userId}:family-trees:${query}` already includes `isPublic` — unchanged.

### Acceptance
- Swagger shows isolated owner/public/shared groups. No handler body duplicated. All existing owner URLs still work.

---

## PHASE 3 — Frontend (FSD: thin pages, shared widget)

### Normalize permissions
Replace `$isOwner` (owner) vs `sharedTree?.canEditMembers` (shared) with one computed store:
```ts
$permissions = { canAdd, canEdit, canDelete, canManageSharedUsers }
// owner  → all true
// shared → mapped from API flags, canManageSharedUsers: false
// public → all false
```

### One parameterized model factory
`shared` (or `entities/tree`) exposes:
```ts
createTreeDetailModel({
  fetchTree,            // api.tree.findById | api.sharedTree.findById | api.publicTree.findById
  resolvePermissions,   // (tree, user) => Permissions
  route,
})
```
Members/connections fetch + add/edit/delete wiring (identical today) lives here once.

### Extract visualization → `widgets/tree-visualization/`
- Component reads `$permissions` instead of `isOwnerRef` / `canAddMembersRef`.
- Add-parents/spouse/child buttons gate on `permissions.canAdd`.
- Edit/delete slots gate on `permissions.canEdit` / `permissions.canDelete`.
- "Shared Users" toolbar link gates on `permissions.canManageSharedUsers`.

### Three thin pages (~15 lines each)
- `pages/tree-owner`     → `/family-trees/:id`
- `pages/tree-shared`    → `/family-trees/:id/shared`
- `pages/tree-public`    → `/family-trees/:id/public`
Each: call factory with its config, render the shared widget.

### API client + routes
- Add a `scope` arg to member/connection clients so one client builds `/members`, `/shared/members`, or `/public/members` (no duplicate client modules).
- Add `treesPublicDetail: '/family-trees/:id/public'` to `shared/config/routing.ts`.
- Add a `publicTree.findById` (or extend `tree`) hitting `/public`.

### Acceptance
- One visualization component, one model factory. Owner/shared/public pages render correctly with mode-appropriate buttons. No visualization duplication remains.

---

## Out of scope / follow-ups
- Swagger basic-auth still hardcoded `admin`/`password` (see implementation-log) — not part of this ticket.
- Consider moving `/family-trees/shared` (list) under a clearer namespace later if collisions are painful.
