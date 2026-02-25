import * as z from 'zod';
import { BaseSchema } from './base.schema';

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
    isPublic: z
      .boolean()
      .default(false)
      .describe('Whether the family tree is public or private'),
  })
  .merge(BaseSchema)
  .describe('Family tree');

type FamilyTreeSchemaType = z.infer<typeof FamilyTreeSchema>;

export { FamilyTreeSchema, type FamilyTreeSchemaType };
