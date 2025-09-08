import * as z from 'zod';
import { BaseSchema } from './base.schema';

enum FamilyTreeConnectionEnum {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
}

const FamilyTreeConnectionSchema = z
  .object({
    familyTreeId: z.string().uuid(),
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    type: z.enum([
      FamilyTreeConnectionEnum.SPOUSE,
      FamilyTreeConnectionEnum.CHILD,
    ]),
  })
  .merge(BaseSchema);

type FamilyTreeConnectionSchemaType = z.infer<
  typeof FamilyTreeConnectionSchema
>;

export {
  FamilyTreeConnectionSchema,
  FamilyTreeConnectionEnum,
  type FamilyTreeConnectionSchemaType,
};
