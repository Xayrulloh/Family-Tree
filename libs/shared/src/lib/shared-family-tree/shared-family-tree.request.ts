import type { z } from 'zod';
import { SharedFamilyTreeSchema } from '../schema';

const SharedFamilyTreeCreateRequestSchema = SharedFamilyTreeSchema.pick({
  familyTreeId: true,
  sharedWithUserId: true,
});

type SharedFamilyTreeCreateRequestType = z.infer<
  typeof SharedFamilyTreeCreateRequestSchema
>;

export {
  SharedFamilyTreeCreateRequestSchema,
  type SharedFamilyTreeCreateRequestType,
};
