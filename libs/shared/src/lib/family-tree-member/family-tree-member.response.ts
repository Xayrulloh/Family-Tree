import type z from 'zod';
import { FamilyTreeMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberGetResponseSchema = FamilyTreeMemberSchema.omit({
  familyTreeId: true,
});

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
  FamilyTreeMemberGetResponseSchema,
  FamilyTreeMemberGetAllResponseSchema,
  type FamilyTreeMemberGetResponseType,
  type FamilyTreeMemberGetAllResponseType,
};
