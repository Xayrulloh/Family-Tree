import type { z } from 'zod';
import { PaginationResponseSchema } from '../pagination';
import { FamilyTreeSchema } from '../schema/family-tree.schema';

const FamilyTreeResponseSchema = FamilyTreeSchema;

const FamilyTreePaginationResponseSchema = PaginationResponseSchema.extend({
  familyTrees: FamilyTreeResponseSchema.array(),
});

type FamilyTreeResponseType = z.infer<typeof FamilyTreeResponseSchema>;

type FamilyTreePaginationResponseType = z.infer<
  typeof FamilyTreePaginationResponseSchema
>;

export {
  FamilyTreeResponseSchema,
  type FamilyTreeResponseType,
  FamilyTreePaginationResponseSchema,
  type FamilyTreePaginationResponseType,
};
