import z from 'zod';
import { MockMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberGetResponseSchema = z.object({
  // realMember: RealUserSchema.nullable(), // TODO: after MVP
  mockMember: MockMemberSchema.nullable(),
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
