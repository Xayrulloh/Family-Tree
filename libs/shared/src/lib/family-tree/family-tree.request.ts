import type { z } from 'zod';
import { PaginationQuerySchema } from '../pagination';
import { FamilyTreeSchema } from '../schema';

const FamilyTreeCreateRequestSchema = FamilyTreeSchema.pick({
  image: true,
  name: true,
});

const FamilyTreeUpdateRequestSchema = FamilyTreeCreateRequestSchema.partial();

const FamilyTreePaginationQuerySchema = PaginationQuerySchema;

type FamilyTreeCreateRequestType = z.infer<
  typeof FamilyTreeCreateRequestSchema
>;

type FamilyTreeUpdateRequestType = z.infer<
  typeof FamilyTreeUpdateRequestSchema
>;

type FamilyTreePaginationQueryType = z.infer<
  typeof FamilyTreePaginationQuerySchema
>;

export {
  FamilyTreeCreateRequestSchema,
  FamilyTreeUpdateRequestSchema,
  FamilyTreePaginationQuerySchema,
  type FamilyTreeCreateRequestType,
  type FamilyTreeUpdateRequestType,
  type FamilyTreePaginationQueryType,
};
