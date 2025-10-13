import * as z from 'zod';
import { BaseSchema } from './base.schema';

const FamilyTreeMemberSchema = z
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

type FamilyTreeMemberSchemaType = z.infer<typeof FamilyTreeMemberSchema>;

export { FamilyTreeMemberSchema, type FamilyTreeMemberSchemaType };
