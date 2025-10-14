import z from 'zod';
import { MemberSchema } from '../schema';

// schemas
const FamilyTreeMemberGetResponseSchema = z.object({
  member: MemberSchema.nullable(),
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
