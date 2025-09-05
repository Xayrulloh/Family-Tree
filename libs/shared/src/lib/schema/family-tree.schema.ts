import * as z from 'zod';
import { BaseSchema } from './base.schema';

const enum FamilyTreeConnectionEnum {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
}

const FamilyTreeSchema = z
  .object({
    createdBy: z.string().min(1).describe('User who created this family tree'),
    name: z.string().min(3).max(20).describe('Name of family tree'),
    image: z
      .string()
      .nullable()
      .describe(
        'Image url which comes only from client side but may delete from back on updates',
      ),
    public: z
      .boolean()
      .default(false)
      .describe('Public or private. Public would be visible to all users'),
  })
  .merge(BaseSchema);

type FamilyTreeSchemaType = z.infer<typeof FamilyTreeSchema>;

export { FamilyTreeSchema, type FamilyTreeSchemaType, FamilyTreeConnectionEnum };
