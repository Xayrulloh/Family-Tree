# Shared Library (`@family-tree/shared`)

## Location: `libs/shared/`
## Package name: `@family-tree/shared`

## Purpose
Single source of truth for request/response types and Zod validation schemas shared between the NestJS API and the React web app. Eliminates type drift between frontend and backend.

## Structure
```
libs/shared/src/lib/
├── base/           # BaseRequest (pagination etc.)
├── schema/         # Zod schemas (the source of truth)
├── pagination/     # PaginationRequest/Response types
├── search/         # SearchRequest type
├── types/          # auth.types.ts (JwtPayloadType)
├── user/           # UserRequest/Response
├── family-tree/    # FamilyTreeRequest/Response
├── family-tree-member/          # FamilyTreeMemberRequest/Response
├── family-tree-member-connection/ # ConnectionRequest/Response
├── shared-family-tree/          # SharedFamilyTreeRequest/Response
├── notification/   # NotificationRequest/Response
├── fcm-token/      # FCMTokenRequest/Response
└── file/           # FileUploadRequest/Response
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
FamilyTreeMemberSchema = { name (min 3), image (nullable), gender (MALE|FEMALE only), dod (nullable), dob (nullable), description (nullable), familyTreeId: uuid } + BaseSchema
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

### `notification.schema.ts`
Notification with sender/receiver user ids + content.

### `fcm-token.schema.ts`
```ts
FCMTokenDeviceEnum = { ANDROID, IOS, WEB }
```

### `pagination.schema.ts`, `search.schema.ts`
Reusable pagination and search query schemas.

## How it's used
- **API**: DTOs in each module's `dto/` folder extend these schemas using `nestjs-zod`'s `createZodDto()`. `@ZodSerializerDto(Schema)` on controller methods validates/strips response shape.
- **Web**: API response types are inferred from schemas. Request bodies typed from `*Request` types.

## Types
- `JwtPayloadType` (`types/auth.types.ts`): `{ sub: string, email: string }` — JWT payload shape
