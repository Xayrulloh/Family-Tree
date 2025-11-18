import type z from 'zod';
import { FamilyTreeMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberCreateRequestSchema = FamilyTreeMemberSchema.omit({
  id: true,
  familyTreeId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

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
