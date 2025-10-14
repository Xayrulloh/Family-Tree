import type z from 'zod';
import { FamilyTreeMemberConnectionSchema } from '../schema';

// schemas
const FamilyTreeMemberConnectionGetResponseSchema =
  FamilyTreeMemberConnectionSchema;

const FamilyTreeMemberConnectionGetAllResponseSchema =
  FamilyTreeMemberConnectionGetResponseSchema.array();

// types
type FamilyTreeMemberConnectionGetResponseType = z.infer<
  typeof FamilyTreeMemberConnectionGetResponseSchema
>;
type FamilyTreeMemberConnectionGetAllResponseType = z.infer<
  typeof FamilyTreeMemberConnectionGetAllResponseSchema
>;

export {
  FamilyTreeMemberConnectionGetResponseSchema,
  FamilyTreeMemberConnectionGetAllResponseSchema,
  type FamilyTreeMemberConnectionGetResponseType,
  type FamilyTreeMemberConnectionGetAllResponseType,
};
