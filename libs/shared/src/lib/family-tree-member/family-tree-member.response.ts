import type z from 'zod';
import { FamilyTreeMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberGetResponseSchema = FamilyTreeMemberSchema;

const FamilyTreeMemberGetAllResponseSchema =
  FamilyTreeMemberGetResponseSchema.array();

// types
type FamilyTreeMemberGetResponseType = z.infer<
  typeof FamilyTreeMemberGetResponseSchema
>;
type FamilyTreeMemberGetAllResponseType = z.infer<
  typeof FamilyTreeMemberGetAllResponseSchema
>;

export {
  FamilyTreeMemberGetAllResponseSchema,
  type FamilyTreeMemberGetAllResponseType,
  FamilyTreeMemberGetResponseSchema,
  type FamilyTreeMemberGetResponseType,
};
