import * as z from 'zod';
import { BaseSchema } from './base.schema';

const SharedFamilyTreeSchema = z
  .object({
    familyTreeId: z.string().describe('Id of family tree'),
    sharedWithUserId: z
      .string()
      .describe('Id of user who accessed this family tree'),
  })
  .merge(BaseSchema)
  .describe('Shared family tree');

type SharedFamilyTreeSchemaType = z.infer<typeof SharedFamilyTreeSchema>;

export { SharedFamilyTreeSchema, type SharedFamilyTreeSchemaType };
