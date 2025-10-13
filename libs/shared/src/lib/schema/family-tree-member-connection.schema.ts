import * as z from 'zod';
import { BaseSchema } from './base.schema';

enum FamilyTreeMemberConnectionEnum {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
}

const FamilyTreeMemberConnectionSchema = z
  .object({
    familyTreeId: z.string().uuid(),
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    type: z.enum([
      FamilyTreeMemberConnectionEnum.SPOUSE,
      FamilyTreeMemberConnectionEnum.CHILD,
    ]),
  })
  .merge(BaseSchema);

type FamilyTreeMemberConnectionSchemaType = z.infer<
  typeof FamilyTreeMemberConnectionSchema
>;

export {
  FamilyTreeMemberConnectionSchema,
  FamilyTreeMemberConnectionEnum,
  type FamilyTreeMemberConnectionSchemaType,
};
