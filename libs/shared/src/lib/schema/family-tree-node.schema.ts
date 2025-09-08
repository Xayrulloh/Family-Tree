import * as z from 'zod';
import { BaseSchema } from './base.schema';

const FamilyTreeNodeSchema = z
  .object({
    familyTreeId: z.string().uuid(),
    realUserId: z
      .string()
      .uuid()
      .describe('The real connected user')
      .nullable(),
    mockUserId: z.string().uuid().describe('The mock created user'),
  })
  .merge(BaseSchema);

type FamilyTreeNodeSchemaType = z.infer<typeof FamilyTreeNodeSchema>;

export { FamilyTreeNodeSchema, type FamilyTreeNodeSchemaType };
