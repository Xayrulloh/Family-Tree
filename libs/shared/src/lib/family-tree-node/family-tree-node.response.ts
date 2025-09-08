import z from 'zod';
import { MockUserSchema, RealUserSchema } from '../schema';

// schemas
const FamilyTreeNodeGetResponseSchema = z.object({
  familyTreeId: z.string().uuid(),
  realUser: RealUserSchema.nullable(),
  mockUser: MockUserSchema.nullable(),
});

const FamilyTreeNodeGetAllResponseSchema =
  FamilyTreeNodeGetResponseSchema.array();

// types
type FamilyTreeNodeGetResponseType = z.infer<
  typeof FamilyTreeNodeGetResponseSchema
>;
type FamilyTreeNodeGetAllResponseType = z.infer<
  typeof FamilyTreeNodeGetAllResponseSchema
>;

export {
  FamilyTreeNodeGetResponseSchema,
  FamilyTreeNodeGetAllResponseSchema,
  type FamilyTreeNodeGetResponseType,
  type FamilyTreeNodeGetAllResponseType,
};
