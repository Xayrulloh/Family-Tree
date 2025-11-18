import z from 'zod';
import { BaseSchema, MemberSchema } from '../schema';

// schemas
const FamilyTreeMemberCreateRequestSchema = MemberSchema.omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeMemberUpdateRequestSchema = MemberSchema.partial().omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeMemberGetParamSchema = z
  .object({
    familyTreeId: z.string().uuid().describe('Family tree id'),
  })
  .merge(BaseSchema.pick({ id: true }).describe('Family tree node id'));

const FamilyTreeMemberGetAllParamSchema = FamilyTreeMemberGetParamSchema.pick({
  familyTreeId: true,
});

// types
type FamilyTreeMemberCreateRequestType = z.infer<
  typeof FamilyTreeMemberCreateRequestSchema
>;

type FamilyTreeMemberUpdateRequestType = z.infer<
  typeof FamilyTreeMemberUpdateRequestSchema
>;

type FamilyTreeMemberGetParamType = z.infer<
  typeof FamilyTreeMemberGetParamSchema
>;

type FamilyTreeMemberGetAllParamType = z.infer<
  typeof FamilyTreeMemberGetAllParamSchema
>;

export {
  FamilyTreeMemberCreateRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  type FamilyTreeMemberCreateRequestType,
  type FamilyTreeMemberUpdateRequestType,
  type FamilyTreeMemberGetParamType,
  type FamilyTreeMemberGetAllParamType,
};
