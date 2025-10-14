import * as z from 'zod';
import { BaseSchema } from './base.schema';

const FamilyTreeMemberSchema = z
  .object({
    familyTreeId: z.string().uuid().describe('The family tree'),
    memberId: z.string().uuid().describe('The member of family tree'),
  })
  .merge(BaseSchema)
  .describe('Family tree member');

type FamilyTreeMemberSchemaType = z.infer<typeof FamilyTreeMemberSchema>;

export { FamilyTreeMemberSchema, type FamilyTreeMemberSchemaType };
