import type { z } from 'zod';
import { SharedFamilyTreeSchema } from '../schema';

const SharedFamilyTreeCreateRequestSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
  userId: true,
});

const SharedFamilyTreeIdParamSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
});

const SharedFamilyTreeUpdateRequestSchema = SharedFamilyTreeSchema.pick({
  canAddMembers: true,
  canDeleteMembers: true,
  canEditMembers: true,
  isBlocked: true,
});

const SharedFamilyTreeUpdateParamSchema = SharedFamilyTreeCreateRequestSchema;

type SharedFamilyTreeCreateRequestType = z.infer<
  typeof SharedFamilyTreeCreateRequestSchema
>;

type SharedFamilyTreeIdParamType = z.infer<
  typeof SharedFamilyTreeIdParamSchema
>;

type SharedFamilyTreeUpdateRequestType = z.infer<
  typeof SharedFamilyTreeUpdateRequestSchema
>;

type SharedFamilyTreeUpdateParamType = z.infer<
  typeof SharedFamilyTreeUpdateParamSchema
>;

export {
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  SharedFamilyTreeUpdateRequestSchema,
  SharedFamilyTreeUpdateParamSchema,
  type SharedFamilyTreeCreateRequestType,
  type SharedFamilyTreeIdParamType,
  type SharedFamilyTreeUpdateRequestType,
  type SharedFamilyTreeUpdateParamType,
};
