import * as z from 'zod';
import { BaseSchema } from './base.schema';

enum FamilyTreeMemberConnectionEnum {
  SPOUSE = 'SPOUSE',
  PARENT = 'PARENT',
}

const FamilyTreeMemberConnectionSchema = z
  .object({
    fromMemberId: z.string().uuid().describe('The id of the from member'),
    toMemberId: z.string().uuid().describe('The id of the to member'),
    type: z
      .enum([
        FamilyTreeMemberConnectionEnum.SPOUSE,
        FamilyTreeMemberConnectionEnum.PARENT,
      ])
      .describe('The type of the family tree connection'),
  })
  .merge(BaseSchema)
  .describe('Family tree member connection');

type FamilyTreeMemberConnectionSchemaType = z.infer<
  typeof FamilyTreeMemberConnectionSchema
>;

export {
  FamilyTreeMemberConnectionSchema,
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionSchemaType,
};
