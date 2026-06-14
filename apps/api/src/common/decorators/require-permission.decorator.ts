import { SetMetadata } from '@nestjs/common';

/**
 * RBAC permission flags on `shared_family_trees` that a route can require.
 */
export type FamilyTreePermission =
  | 'canAddMembers'
  | 'canEditMembers'
  | 'canDeleteMembers';

export const REQUIRE_PERMISSION_KEY = 'requireFamilyTreePermission';

/**
 * Declares which shared-tree permission(s) a route needs. Read by
 * `FamilyTreeAccessGuard`:
 * - the owner always passes (flags ignored)
 * - a public tree only passes when NO permission is required (read-only)
 * - a shared user must hold every listed flag (and not be blocked)
 *
 * Omit the decorator entirely for read-only routes.
 */
export const RequirePermission = (...permissions: FamilyTreePermission[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions);
