import type z from 'zod';
import { FamilyTreeMemberSchema } from '../schema';
import { FamilyTreeMemberConnectionCreateRequestSchema } from '../family-tree-member-connection';

// schemas
const FamilyTreeMemberCreateRequestSchema = FamilyTreeMemberSchema.omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeMemberCreateChildRequestSchema = FamilyTreeMemberSchema.pick({
  gender: true,
}).merge(
  FamilyTreeMemberConnectionCreateRequestSchema.pick({
    fromMemberId: true,
  }),
);

const FamilyTreeMemberUpdateRequestSchema =
  FamilyTreeMemberCreateRequestSchema.partial();

const FamilyTreeMemberGetParamSchema = FamilyTreeMemberSchema.pick({
  id: true,
  familyTreeId: true,
});

const FamilyTreeMemberGetAllParamSchema = FamilyTreeMemberSchema.pick({
  familyTreeId: true,
});

// types
type FamilyTreeMemberCreateRequestType = z.infer<
  typeof FamilyTreeMemberCreateRequestSchema
>;

type FamilyTreeMemberCreateChildRequestType = z.infer<
  typeof FamilyTreeMemberCreateChildRequestSchema
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
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  type FamilyTreeMemberCreateRequestType,
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberUpdateRequestType,
  type FamilyTreeMemberGetParamType,
  type FamilyTreeMemberGetAllParamType,
};
