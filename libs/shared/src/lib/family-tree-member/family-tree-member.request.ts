import z from 'zod';
import { BaseSchema, MockMemberSchema } from '../schema';

// schemas
const FamilyTreeMemberCreateRequestSchema = MockMemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// TODO: after MVP
// const FamilyTreeRealMemberBindRequestSchema = FamilyTreeMemberSchema.omit({
//   mockMemberId: true,
//   familyTreeId: true,
// }).required({
//   realUserId: true,
// });

const FamilyTreeMemberUpdateRequestSchema = MockMemberSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

const FamilyTreeMemberGetParamSchema = z
  .object({
    familyTreeId: z.string().uuid().describe('Family tree id'),
  })
  .merge(BaseSchema.pick({ id: true }).describe('Family tree node id'));

const FamilyTreeMemberGetAllParamSchema = FamilyTreeMemberGetParamSchema.pick({
  familyTreeId: true,
});

// types
type FamilyTreeMemberCreateRequestType = z.infer<
  typeof FamilyTreeMemberCreateRequestSchema
>;
// type FamilyTreeRealMemberBindRequestType = z.infer<
//   typeof FamilyTreeRealMemberBindRequestSchema
// >;
type FamilyTreeMemberUpdateRequestType = z.infer<
  typeof FamilyTreeMemberUpdateRequestSchema
>;

type FamilyTreeMemberGetParamType = z.infer<
  typeof FamilyTreeMemberGetParamSchema
>;

type FamilyTreeMemberGetAllParamType = z.infer<
  typeof FamilyTreeMemberGetAllParamSchema
>;

export {
  FamilyTreeMemberCreateRequestSchema,
  // FamilyTreeRealMemberBindRequestSchema,
  FamilyTreeMemberUpdateRequestSchema,
  FamilyTreeMemberGetParamSchema,
  FamilyTreeMemberGetAllParamSchema,
  type FamilyTreeMemberCreateRequestType,
  // type FamilyTreeRealMemberBindRequestType,
  type FamilyTreeMemberUpdateRequestType,
  type FamilyTreeMemberGetParamType,
  type FamilyTreeMemberGetAllParamType,
};
