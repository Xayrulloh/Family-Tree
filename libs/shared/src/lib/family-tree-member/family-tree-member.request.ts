import type z from 'zod';
import {
  FamilyTreeMemberConnectionSchema,
  FamilyTreeMemberSchema,
} from '../schema';

// schemas
const FamilyTreeMemberCreateChildRequestSchema = FamilyTreeMemberSchema.pick({
  gender: true,
}).merge(
  FamilyTreeMemberConnectionSchema.pick({
    fromMemberId: true,
  }),
);

const FamilyTreeMemberCreateSpouseRequestSchema =
  FamilyTreeMemberConnectionSchema.pick({
    fromMemberId: true,
  });

const FamilyTreeMemberCreateParentsRequestSchema =
  FamilyTreeMemberCreateSpouseRequestSchema;

const FamilyTreeMemberUpdateRequestSchema = FamilyTreeMemberSchema.omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

const FamilyTreeMemberGetParamSchema = FamilyTreeMemberSchema.pick({
  id: true,
  familyTreeId: true,
});

const FamilyTreeMemberGetAllParamSchema = FamilyTreeMemberSchema.pick({
  familyTreeId: true,
});

// types
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
  FamilyTreeMemberCreateChildRequestSchema,
  FamilyTreeMemberCreateSpouseRequestSchema,
  FamilyTreeMemberCreateParentsRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  type FamilyTreeMemberCreateChildRequestType,
  type FamilyTreeMemberCreateSpouseRequestType,
  type FamilyTreeMemberCreateParentsRequestType,
  type FamilyTreeMemberUpdateRequestType,
  type FamilyTreeMemberGetParamType,
  type FamilyTreeMemberGetAllParamType,
};
