import type { z } from 'zod';
import { FamilyTreeSchema } from '../schema';

const FamilyTreeCreateRequestSchema = FamilyTreeSchema.pick({
  image: true,
  name: true,
});

const FamilyTreeUpdateRequestSchema = FamilyTreeCreateRequestSchema.partial();

type FamilyTreeCreateRequestType = z.infer<
  typeof FamilyTreeCreateRequestSchema
>;

type FamilyTreeUpdateRequestType = z.infer<
  typeof FamilyTreeUpdateRequestSchema
>;

export {
  FamilyTreeCreateRequestSchema,
  type FamilyTreeCreateRequestType,
  FamilyTreeUpdateRequestSchema,
  type FamilyTreeUpdateRequestType,
};
