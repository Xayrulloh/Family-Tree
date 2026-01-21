import type { z } from 'zod';
import { PaginationQuerySchema } from '../pagination';
import { SharedFamilyTreeSchema } from '../schema';

const SharedFamilyTreeCreateRequestSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
  userId: true,
});

const SharedFamilyTreeIdParamSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
});

const SharedFamilyTreeQuerySchema = PaginationQuerySchema;

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

type SharedFamilyTreeQueryType = z.infer<typeof SharedFamilyTreeQuerySchema>;

type SharedFamilyTreeUpdateRequestType = z.infer<
  typeof SharedFamilyTreeUpdateRequestSchema
>;

type SharedFamilyTreeUpdateParamType = z.infer<
  typeof SharedFamilyTreeUpdateParamSchema
>;

export {
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  SharedFamilyTreeQuerySchema,
  SharedFamilyTreeUpdateRequestSchema,
  SharedFamilyTreeUpdateParamSchema,
  type SharedFamilyTreeCreateRequestType,
  type SharedFamilyTreeIdParamType,
  type SharedFamilyTreeQueryType,
  type SharedFamilyTreeUpdateRequestType,
  type SharedFamilyTreeUpdateParamType,
};
