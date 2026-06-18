import * as z from 'zod';
import { BaseSchema } from './base.schema';

const FamilyTreeSharedSchema = z
  .object({
    familyTreeId: z.string().describe('Id of family tree'),
    userId: z.string().describe('Id of user who accessed this family tree'),
    isBlocked: z.boolean().describe('Is blocked'),
    canEditMembers: z.boolean().describe('Can edit members'),
    canDeleteMembers: z.boolean().describe('Can delete members'),
    canAddMembers: z.boolean().describe('Can add members'),
  })
  .merge(BaseSchema)
  .describe('Shared family tree');

type FamilyTreeSharedSchemaType = z.infer<typeof FamilyTreeSharedSchema>;

export { FamilyTreeSharedSchema, type FamilyTreeSharedSchemaType };
