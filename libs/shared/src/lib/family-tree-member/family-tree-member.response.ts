import z from 'zod';
import { FamilyTreeMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberGetResponseSchema = FamilyTreeMemberSchema;

const FamilyTreeMemberGetAllResponseSchema =
  FamilyTreeMemberGetResponseSchema.array();

const FamilyTreeMemberDeletePreviewSchema = z.object({
  canDelete: z.boolean(),
  blockReason: z.string().nullable(),
  spouseToDelete: FamilyTreeMemberGetResponseSchema.nullable(),
});

// types
type FamilyTreeMemberGetResponseType = z.infer<
  typeof FamilyTreeMemberGetResponseSchema
>;
type FamilyTreeMemberGetAllResponseType = z.infer<
  typeof FamilyTreeMemberGetAllResponseSchema
>;
type FamilyTreeMemberDeletePreviewType = z.infer<
  typeof FamilyTreeMemberDeletePreviewSchema
>;

export {
  FamilyTreeMemberDeletePreviewSchema,
  type FamilyTreeMemberDeletePreviewType,
  FamilyTreeMemberGetAllResponseSchema,
  type FamilyTreeMemberGetAllResponseType,
  FamilyTreeMemberGetResponseSchema,
  type FamilyTreeMemberGetResponseType,
};
