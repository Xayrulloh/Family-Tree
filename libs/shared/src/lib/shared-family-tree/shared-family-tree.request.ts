import type { z } from 'zod';
import { PaginationQuerySchema } from '../pagination';
import { SharedFamilyTreeSchema } from '../schema';
import { SearchByNameQuerySchema } from '../search';

const SharedFamilyTreeCreateRequestSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
  userId: true,
});

const SharedFamilyTreeIdParamSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
});

const SharedFamilyTreePaginationAndSearchQuerySchema =
  PaginationQuerySchema.merge(SearchByNameQuerySchema);

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

type SharedFamilyTreePaginationAndSearchQueryType = z.infer<
  typeof SharedFamilyTreePaginationAndSearchQuerySchema
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
  SharedFamilyTreePaginationAndSearchQuerySchema,
  SharedFamilyTreeUpdateRequestSchema,
  SharedFamilyTreeUpdateParamSchema,
  type SharedFamilyTreeCreateRequestType,
  type SharedFamilyTreeIdParamType,
  type SharedFamilyTreePaginationAndSearchQueryType,
  type SharedFamilyTreeUpdateRequestType,
  type SharedFamilyTreeUpdateParamType,
};
