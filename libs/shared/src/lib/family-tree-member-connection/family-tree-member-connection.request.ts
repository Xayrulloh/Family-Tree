import z from 'zod';
import { BaseSchema, FamilyTreeMemberConnectionSchema } from '../schema';

const FamilyTreeMemberConnectionCreateRequestSchema =
  FamilyTreeMemberConnectionSchema.pick({
    fromUserId: true,
    toUserId: true,
    type: true,
  });

const FamilyTreeMemberConnectionUpdateRequestSchema =
  FamilyTreeMemberConnectionCreateRequestSchema;

const FamilyTreeMemberConnectionGetParamSchema = z
  .object({
    familyTreeId: z.string().uuid().describe('Family tree id'),
  })
  .merge(BaseSchema.pick({ id: true }).describe('Family tree node id'));

const FamilyTreeMemberConnectionGetAllParamSchema =
  FamilyTreeMemberConnectionGetParamSchema.pick({
    familyTreeId: true,
  });

const FamilyTreeMemberConnectionGetByMemberParamSchema =
  FamilyTreeMemberConnectionGetAllParamSchema.merge(
    z.object({
      memberUserId: z.string().uuid().describe('Member user id'),
    }),
  );

type FamilyTreeMemberConnectionCreateRequestType = z.infer<
  typeof FamilyTreeMemberConnectionCreateRequestSchema
>;

type FamilyTreeMemberConnectionUpdateRequestType = z.infer<
  typeof FamilyTreeMemberConnectionUpdateRequestSchema
>;

type FamilyTreeMemberConnectionGetParamType = z.infer<
  typeof FamilyTreeMemberConnectionGetParamSchema
>;

type FamilyTreeMemberConnectionGetAllParamType = z.infer<
  typeof FamilyTreeMemberConnectionGetAllParamSchema
>;

type FamilyTreeMemberConnectionGetByMemberParamType = z.infer<
  typeof FamilyTreeMemberConnectionGetByMemberParamSchema
>;

export {
  FamilyTreeMemberConnectionCreateRequestSchema,
  type FamilyTreeMemberConnectionCreateRequestType,
  FamilyTreeMemberConnectionUpdateRequestSchema,
  type FamilyTreeMemberConnectionUpdateRequestType,
  FamilyTreeMemberConnectionGetParamSchema,
  type FamilyTreeMemberConnectionGetParamType,
  FamilyTreeMemberConnectionGetAllParamSchema,
  type FamilyTreeMemberConnectionGetAllParamType,
  FamilyTreeMemberConnectionGetByMemberParamSchema,
  type FamilyTreeMemberConnectionGetByMemberParamType,
};
