import z from 'zod';
import { BaseSchema } from '../schema';

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
  FamilyTreeMemberConnectionGetParamSchema,
  type FamilyTreeMemberConnectionGetParamType,
  FamilyTreeMemberConnectionGetAllParamSchema,
  type FamilyTreeMemberConnectionGetAllParamType,
  FamilyTreeMemberConnectionGetByMemberParamSchema,
  type FamilyTreeMemberConnectionGetByMemberParamType,
};
