# Shared Library (`@family-tree/shared`)

## Location: `libs/shared/`
## Package name: `@family-tree/shared`

## Purpose
Single source of truth for request/response types and Zod validation schemas shared between the NestJS API and the React web app.

## Structure
```
libs/shared/src/lib/
├── base/           # BaseRequest
├── schema/         # Zod schemas (source of truth)
├── pagination/     # PaginationRequest/Response
├── search/         # SearchRequest
├── types/          # auth.types.ts (JwtPayloadType)
├── user/           # UserRequest/Response
├── family-tree/    # FamilyTreeRequest/Response
├── family-tree-member/
├── family-tree-member-connection/
├── shared-family-tree/
├── notification/
├── fcm-token/
└── file/
```

## Zod Schemas (`src/lib/schema/`)

### `base.schema.ts`
```ts
BaseSchema = { id: uuid, createdAt: string, updatedAt: string, deletedAt: string | null }
```

### `user.schema.ts`
```ts
UserGenderEnum = { MALE, FEMALE, UNKNOWN }
UserSchema = { email, name, username, image (nullable), gender, dod (nullable), dob (nullable), description (nullable) } + BaseSchema
```

### `family-tree.schema.ts`
```ts
FamilyTreeSchema = { createdBy: uuid, name (3–20 chars), image (nullable), isPublic: boolean (default false) } + BaseSchema
```

### `family-tree-member.schema.ts`
```ts
FamilyTreeMemberSchema = { name (min 3), image (nullable), gender (MALE|FEMALE only), dod, dob, description, familyTreeId: uuid } + BaseSchema
```

### `family-tree-member-connection.schema.ts`
```ts
FamilyTreeMemberConnectionEnum = { SPOUSE, PARENT }
FamilyTreeMemberConnectionSchema = { fromMemberId: uuid, toMemberId: uuid, type: SPOUSE|PARENT } + BaseSchema
```

### `shared-family-tree.schema.ts`
```ts
SharedFamilyTreeSchema = { familyTreeId, userId, isBlocked, canEditMembers, canDeleteMembers, canAddMembers } + BaseSchema
```

### Others
`notification.schema.ts`, `fcm-token.schema.ts` (FCMTokenDeviceEnum: ANDROID/IOS/WEB), `pagination.schema.ts`, `search.schema.ts`

## How it's used
- **API**: DTOs extend schemas via `nestjs-zod`'s `createZodDto()`. `@ZodSerializerDto(Schema)` validates/strips response shape.
- **Web**: API response types inferred from schemas. Request bodies typed from `*Request` types.

## Types
- `JwtPayloadType`: `{ sub: string, email: string }` — JWT payload shape
