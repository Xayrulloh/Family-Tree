# 📦 Shared Library

**Single source of truth for types, schemas, and validation across the Family Tree monorepo.**

This library provides shared TypeScript types and Zod validation schemas used by both the backend (NestJS) and frontend (React) applications, ensuring **100% type accuracy** and consistency across the entire stack.

---

## 🎯 Purpose

The shared library eliminates type mismatches and validation inconsistencies by:

- ✅ **Single Source of Truth** - Define types and schemas once, use everywhere
- ✅ **Type Safety** - Full TypeScript support across frontend and backend
- ✅ **Runtime Validation** - Zod schemas validate data at runtime
- ✅ **API Contract** - Guarantees request/response structure consistency
- ✅ **DRY Principle** - No duplicate type definitions
- ✅ **Refactor Safety** - Change once, update everywhere automatically

---

## 🏗️ Architecture

The library is organized by domain entities, each containing:

```
libs/shared/src/lib/
├── schema/              # Zod schemas (base entity definitions)
├── {entity}/            # Request/Response types per entity
│   ├── *.request.ts     # API request schemas & types
│   ├── *.response.ts    # API response schemas & types
│   └── index.ts         # Exports
├── types/               # Utility types
└── index.ts             # Main export file
```

### Domain Entities

- **base** - Common base schemas (ID, timestamps)
- **user** - User authentication and profile
- **family-tree** - Family tree entities
- **family-tree-member** - Individual family members
- **family-tree-member-connection** - Relationships (spouse, parent-child)
- **file** - File upload and management
- **notification** - Push notifications
- **fcm-token** - Firebase Cloud Messaging tokens

---

## 📋 Core Schemas

### Base Schema

Foundation for all entities with common fields:

```typescript
import { BaseSchema } from '@family-tree/shared';

// Schema definition
const BaseSchema = z.object({
  id: z.string().uuid(),           // Primary key (UUID)
  createdAt: z.coerce.date(),      // Creation timestamp
  updatedAt: z.coerce.date(),      // Last update timestamp
  deletedAt: z.coerce.date().nullable(), // Soft delete timestamp
});

type BaseSchemaType = z.infer<typeof BaseSchema>;
```

**Usage**: All entity schemas extend `BaseSchema` using `.merge(BaseSchema)`.

---

### User Schema

Authenticated user data from Google OAuth:

```typescript
import { UserSchema, UserGenderEnum } from '@family-tree/shared';

const UserSchema = z.object({
  email: z.string().email(),       // Google email
  name: z.string().min(3),         // Display name
  username: z.string(),            // Unique username
  image: z.string().nullable(),    // Profile image URL
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  dob: z.string().date().nullable(), // Date of birth
  dod: z.string().date().nullable(), // Date of death
  description: z.string().nullable(),
}).merge(BaseSchema);

type UserSchemaType = z.infer<typeof UserSchema>;
```

**Enums**:
- `UserGenderEnum.MALE`
- `UserGenderEnum.FEMALE`
- `UserGenderEnum.UNKNOWN`

---

### Family Tree Member Schema

Individual family tree members:

```typescript
import { FamilyTreeMemberSchema } from '@family-tree/shared';

const FamilyTreeMemberSchema = z.object({
  name: z.string().min(3),         // Member name
  image: z.string().nullable(),    // Profile image URL
  gender: z.enum(['MALE', 'FEMALE']),
  dob: z.string().date().nullable(), // Date of birth
  dod: z.string().date().nullable(), // Date of death
  description: z.string().nullable(),
  familyTreeId: z.string().uuid(), // Parent tree reference
}).merge(BaseSchema);

type FamilyTreeMemberSchemaType = z.infer<typeof FamilyTreeMemberSchema>;
```

---

### Family Tree Member Connection Schema

Relationships between family members:

```typescript
import { 
  FamilyTreeMemberConnectionSchema,
  FamilyTreeMemberConnectionEnum 
} from '@family-tree/shared';

const FamilyTreeMemberConnectionSchema = z.object({
  type: z.enum(['SPOUSE', 'PARENT']), // Connection type
  fromMemberId: z.string().uuid(),    // Source member
  toMemberId: z.string().uuid(),      // Target member
  familyTreeId: z.string().uuid(),    // Parent tree reference
}).merge(BaseSchema);

type FamilyTreeMemberConnectionSchemaType = z.infer<typeof FamilyTreeMemberConnectionSchema>;
```

**Enums**:
- `FamilyTreeMemberConnectionEnum.SPOUSE` - Marriage connection
- `FamilyTreeMemberConnectionEnum.PARENT` - Parent-child connection

---

## 🔄 Request & Response Types

Each entity has dedicated request and response types derived from base schemas.

### Example: Family Tree Member

#### Request Types

```typescript
import {
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberUpdateRequestType,
} from '@family-tree/shared';

// Create child request
const createChildSchema = FamilyTreeMemberSchema.pick({
  gender: true,
}).merge(
  FamilyTreeMemberConnectionSchema.pick({
    fromMemberId: true,
  })
);

// Update request (all fields optional)
const updateSchema = FamilyTreeMemberSchema.omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();
```

#### Response Types

```typescript
import {
  FamilyTreeMemberGetResponseSchema,
  FamilyTreeMemberGetAllResponseSchema,
  type FamilyTreeMemberGetResponseType,
  type FamilyTreeMemberGetAllResponseType,
} from '@family-tree/shared';

// Single member response
const getResponseSchema = FamilyTreeMemberSchema;

// Array of members response
const getAllResponseSchema = FamilyTreeMemberGetResponseSchema.array();
```

---

## 📖 Usage Examples

### Backend (NestJS)

```typescript
// In a NestJS controller
import { 
  FamilyTreeMemberCreateChildRequestSchema,
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberGetResponseType,
} from '@family-tree/shared';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('members')
export class MembersController {
  @Post('child')
  async createChild(
    @Body(new ZodValidationPipe(FamilyTreeMemberCreateChildRequestSchema))
    body: FamilyTreeMemberCreateChildRequestType,
  ): Promise<FamilyTreeMemberGetResponseType> {
    // body is fully typed and validated
    return this.membersService.createChild(body);
  }
}
```

### Frontend (React + Effector)

```typescript
// In an Effector effect
import {
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberGetResponseType,
} from '@family-tree/shared';
import { createEffect } from 'effector';
import { api } from '~/shared/api';

export const createChildFx = createEffect<
  FamilyTreeMemberCreateChildRequestType,
  FamilyTreeMemberGetResponseType
>(async (data) => {
  const response = await api.post<FamilyTreeMemberGetResponseType>(
    '/members/child',
    data
  );
  return response.data;
});
```

### Frontend (React Hook Form)

```typescript
// In a form component
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  FamilyTreeMemberUpdateRequestSchema,
  type FamilyTreeMemberUpdateRequestType,
} from '@family-tree/shared';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit } = useForm<FamilyTreeMemberUpdateRequestType>({
    resolver: zodResolver(FamilyTreeMemberUpdateRequestSchema),
  });

  const onSubmit = (data: FamilyTreeMemberUpdateRequestType) => {
    // data is validated and typed
    updateMemberFx(data);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

---

## 🔍 Available Exports

### Schemas (Zod)

All base entity schemas for validation:

```typescript
import {
  BaseSchema,
  UserSchema,
  FamilyTreeSchema,
  FamilyTreeMemberSchema,
  FamilyTreeMemberConnectionSchema,
  NotificationSchema,
  FcmTokenSchema,
} from '@family-tree/shared';
```

### Request Types

API request schemas and types:

```typescript
import {
  // Family Tree Member
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberCreateSpouseRequestSchema,
  FamilyTreeMemberCreateParentsRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  
  // Types
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberUpdateRequestType,
  // ... and more
} from '@family-tree/shared';
```

### Response Types

API response schemas and types:

```typescript
import {
  FamilyTreeMemberGetResponseSchema,
  FamilyTreeMemberGetAllResponseSchema,
  type FamilyTreeMemberGetResponseType,
  type FamilyTreeMemberGetAllResponseType,
} from '@family-tree/shared';
```

### Enums

```typescript
import {
  UserGenderEnum,
  FamilyTreeMemberConnectionEnum,
} from '@family-tree/shared';
```

---

## 🛠️ Development

### Adding a New Schema

1. **Create the base schema** in `libs/shared/src/lib/schema/{entity}.schema.ts`:

```typescript
import { z } from 'zod';
import { BaseSchema } from './base.schema';

const MyEntitySchema = z.object({
  name: z.string().min(1),
  // ... other fields
}).merge(BaseSchema);

type MyEntitySchemaType = z.infer<typeof MyEntitySchema>;

export { MyEntitySchema, type MyEntitySchemaType };
```

2. **Create request types** in `libs/shared/src/lib/{entity}/{entity}.request.ts`:

```typescript
import type z from 'zod';
import { MyEntitySchema } from '../schema';

const MyEntityCreateRequestSchema = MyEntitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

type MyEntityCreateRequestType = z.infer<typeof MyEntityCreateRequestSchema>;

export { MyEntityCreateRequestSchema, type MyEntityCreateRequestType };
```

3. **Create response types** in `libs/shared/src/lib/{entity}/{entity}.response.ts`:

```typescript
import type z from 'zod';
import { MyEntitySchema } from '../schema';

const MyEntityGetResponseSchema = MyEntitySchema;

type MyEntityGetResponseType = z.infer<typeof MyEntityGetResponseSchema>;

export { MyEntityGetResponseSchema, type MyEntityGetResponseType };
```

4. **Export from index files** and use across the monorepo!

---

## 🧪 Testing

The shared library ensures type safety at compile time and runtime validation:

```typescript
import { FamilyTreeMemberSchema } from '@family-tree/shared';

// Runtime validation
const result = FamilyTreeMemberSchema.safeParse(data);

if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.error('Invalid:', result.error.errors);
}
```

---

## 📚 Key Technologies

- **[Zod](https://zod.dev)** - TypeScript-first schema validation
- **[TypeScript](https://www.typescriptlang.org)** - Static type checking
- **[Nx](https://nx.dev)** - Monorepo tooling

---

## 🔗 Related Documentation

- **Backend API**: See [apps/api/README.md](../../apps/api/README.md)
- **Frontend Web**: See [apps/web/README.md](../../apps/web/README.md)
- **Main README**: See [root README.md](../../README.md)

---

<div align="center">
  <p>Built with 🔒 Zod for type-safe validation</p>
  <p>Ensuring 100% accuracy across the stack</p>
</div>
