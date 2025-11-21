import type z from 'zod';
import { FamilyTreeMemberConnectionCreateRequestSchema } from '../family-tree-member-connection';
import { FamilyTreeMemberSchema } from '../schema';

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

const FamilyTreeMemberCreateSpouseRequestSchema =
  FamilyTreeMemberConnectionCreateRequestSchema.pick({
    fromMemberId: true,
  });

const FamilyTreeMemberCreateParentsRequestSchema =
  FamilyTreeMemberCreateSpouseRequestSchema;

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

type FamilyTreeMemberCreateSpouseRequestType = z.infer<
  typeof FamilyTreeMemberCreateSpouseRequestSchema
>;

type FamilyTreeMemberCreateParentsRequestType = z.infer<
  typeof FamilyTreeMemberCreateParentsRequestSchema
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
  FamilyTreeMemberCreateSpouseRequestSchema,
  FamilyTreeMemberCreateParentsRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  type FamilyTreeMemberCreateRequestType,
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberCreateSpouseRequestType,
  type FamilyTreeMemberCreateParentsRequestType,
  type FamilyTreeMemberUpdateRequestType,
  type FamilyTreeMemberGetParamType,
  type FamilyTreeMemberGetAllParamType,
};
