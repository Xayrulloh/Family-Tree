import type { z } from 'zod';
import { SharedFamilyTreeSchema } from '../schema';

const SharedFamilyTreeCreateRequestSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
  sharedWithUserId: true,
});

const SharedFamilyTreeIdParamSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
});

type SharedFamilyTreeCreateRequestType = z.infer<
  typeof SharedFamilyTreeCreateRequestSchema
>;

type SharedFamilyTreeIdParamType = z.infer<
  typeof SharedFamilyTreeIdParamSchema
>;

export {
  SharedFamilyTreeCreateRequestSchema,
  SharedFamilyTreeIdParamSchema,
  type SharedFamilyTreeCreateRequestType,
  type SharedFamilyTreeIdParamType,
};
