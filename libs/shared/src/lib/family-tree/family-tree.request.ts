import type { z } from 'zod';
import { PaginationQuerySchema } from '../pagination';
import { FamilyTreeSchema } from '../schema';
import { SearchByNameQuerySchema, SearchByPublicQuerySchema } from '../search';

const FamilyTreeCreateRequestSchema = FamilyTreeSchema.pick({
  image: true,
  name: true,
  isPublic: true,
});

const FamilyTreeUpdateRequestSchema = FamilyTreeCreateRequestSchema.partial();

const FamilyTreePaginationAndSearchQuerySchema = PaginationQuerySchema.merge(
  SearchByNameQuerySchema.merge(SearchByPublicQuerySchema),
);

type FamilyTreeCreateRequestType = z.infer<
  typeof FamilyTreeCreateRequestSchema
>;

type FamilyTreeUpdateRequestType = z.infer<
  typeof FamilyTreeUpdateRequestSchema
>;

type FamilyTreePaginationAndSearchQueryType = z.infer<
  typeof FamilyTreePaginationAndSearchQuerySchema
>;

export {
  FamilyTreeCreateRequestSchema,
  type FamilyTreeCreateRequestType,
  FamilyTreePaginationAndSearchQuerySchema,
  type FamilyTreePaginationAndSearchQueryType,
  FamilyTreeUpdateRequestSchema,
  type FamilyTreeUpdateRequestType,
};
