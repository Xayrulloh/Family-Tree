import type { z } from 'zod';
import { PaginationQuerySchema } from '../pagination';
import { FamilyTreeSharedSchema } from '../schema';
import { SearchByNameQuerySchema } from '../search';

const FamilyTreeSharedCreateRequestSchema = FamilyTreeSharedSchema.pick({
  familyTreeId: true,
  userId: true,
});

const FamilyTreeSharedIdParamSchema = FamilyTreeSharedSchema.pick({
  familyTreeId: true,
});

const FamilyTreeSharedPaginationAndSearchQuerySchema =
  PaginationQuerySchema.merge(SearchByNameQuerySchema);

const FamilyTreeSharedUpdateRequestSchema = FamilyTreeSharedSchema.pick({
  canAddMembers: true,
  canDeleteMembers: true,
  canEditMembers: true,
  isBlocked: true,
});

const FamilyTreeSharedUpdateParamSchema = FamilyTreeSharedCreateRequestSchema;

type FamilyTreeSharedCreateRequestType = z.infer<
  typeof FamilyTreeSharedCreateRequestSchema
>;

type FamilyTreeSharedIdParamType = z.infer<
  typeof FamilyTreeSharedIdParamSchema
>;

type FamilyTreeSharedPaginationAndSearchQueryType = z.infer<
  typeof FamilyTreeSharedPaginationAndSearchQuerySchema
>;

type FamilyTreeSharedUpdateRequestType = z.infer<
  typeof FamilyTreeSharedUpdateRequestSchema
>;

type FamilyTreeSharedUpdateParamType = z.infer<
  typeof FamilyTreeSharedUpdateParamSchema
>;

export {
  FamilyTreeSharedCreateRequestSchema,
  type FamilyTreeSharedCreateRequestType,
  FamilyTreeSharedIdParamSchema,
  type FamilyTreeSharedIdParamType,
  FamilyTreeSharedPaginationAndSearchQuerySchema,
  type FamilyTreeSharedPaginationAndSearchQueryType,
  FamilyTreeSharedUpdateParamSchema,
  type FamilyTreeSharedUpdateParamType,
  FamilyTreeSharedUpdateRequestSchema,
  type FamilyTreeSharedUpdateRequestType,
};
