import type { z } from 'zod';
import { FamilyTreeSchema } from '../schema';

const SharedFamilyTreeResponseSchema = FamilyTreeSchema;

const SharedFamilyTreeArrayResponseSchema =
  SharedFamilyTreeResponseSchema.array();

type SharedFamilyTreeResponseType = z.infer<
  typeof SharedFamilyTreeResponseSchema
>;

type SharedFamilyTreeArrayResponseType = z.infer<
  typeof SharedFamilyTreeArrayResponseSchema
>;

export {
  SharedFamilyTreeResponseSchema,
  type SharedFamilyTreeResponseType,
  SharedFamilyTreeArrayResponseSchema,
  type SharedFamilyTreeArrayResponseType,
};
