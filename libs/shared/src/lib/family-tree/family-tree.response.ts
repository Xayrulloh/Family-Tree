import type { z } from 'zod';
import { PaginationResponseSchema } from '../pagination';
import { FamilyTreeSchema } from '../schema/family-tree.schema';

const FamilyTreeResponseSchema = FamilyTreeSchema;

const FamilyTreePaginationResponseSchema = PaginationResponseSchema.extend({
  familyTrees: FamilyTreeResponseSchema.array(),
});

const FamilyTreePreviewResponseSchema = FamilyTreeSchema.pick({
  name: true,
  image: true,
});

type FamilyTreeResponseType = z.infer<typeof FamilyTreeResponseSchema>;

type FamilyTreePaginationResponseType = z.infer<
  typeof FamilyTreePaginationResponseSchema
>;

type FamilyTreePreviewResponseType = z.infer<
  typeof FamilyTreePreviewResponseSchema
>;

export {
  FamilyTreePaginationResponseSchema,
  type FamilyTreePaginationResponseType,
  FamilyTreePreviewResponseSchema,
  type FamilyTreePreviewResponseType,
  FamilyTreeResponseSchema,
  type FamilyTreeResponseType,
};
