import z from 'zod';
import { BaseSchema, FamilyTreeMemberSchema, MockUserSchema } from '../schema';

// schemas
const FamilyTreeNodeCreateRequestSchema = MockUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeNodeBindRequestSchema = FamilyTreeMemberSchema.omit({
  mockUserId: true,
  familyTreeId: true,
}).required({
  realUserId: true,
});

const FamilyTreeNodeUpdateRequestSchema = MockUserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeNodeGetParamSchema = z
  .object({
    familyTreeId: z.string().uuid().describe('Family tree id'),
  })
  .merge(BaseSchema.pick({ id: true }).describe('Family tree node id'));

const FamilyTreeNodeGetAllParamSchema = FamilyTreeNodeGetParamSchema.pick({
  familyTreeId: true,
});

// types
type FamilyTreeNodeCreateRequestType = z.infer<
  typeof FamilyTreeNodeCreateRequestSchema
>;
type FamilyTreeNodeBindRequestType = z.infer<
  typeof FamilyTreeNodeBindRequestSchema
>;
type FamilyTreeNodeUpdateRequestType = z.infer<
  typeof FamilyTreeNodeUpdateRequestSchema
>;

type FamilyTreeNodeGetParamType = z.infer<typeof FamilyTreeNodeGetParamSchema>;

type FamilyTreeNodeGetAllParamType = z.infer<
  typeof FamilyTreeNodeGetAllParamSchema
>;

export {
  FamilyTreeNodeCreateRequestSchema,
  FamilyTreeNodeBindRequestSchema,
  FamilyTreeNodeUpdateRequestSchema,
  FamilyTreeNodeGetParamSchema,
  FamilyTreeNodeGetAllParamSchema,
  type FamilyTreeNodeCreateRequestType,
  type FamilyTreeNodeBindRequestType,
  type FamilyTreeNodeUpdateRequestType,
  type FamilyTreeNodeGetParamType,
  type FamilyTreeNodeGetAllParamType,
};
