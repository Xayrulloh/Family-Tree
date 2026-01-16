import type { z } from 'zod';
import {
  FamilyTreeSchema,
  SharedFamilyTreeSchema,
  UserSchema,
} from '../schema';

const SharedFamilyTreeResponseSchema = FamilyTreeSchema.merge(
  SharedFamilyTreeSchema.pick({
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    isBlocked: true,
  }),
);

const SharedFamilyTreeArrayResponseSchema =
  SharedFamilyTreeResponseSchema.array();

const SharedFamilyTreeUsersArrayResponseSchema = UserSchema.array();

type SharedFamilyTreeResponseType = z.infer<
  typeof SharedFamilyTreeResponseSchema
>;

type SharedFamilyTreeArrayResponseType = z.infer<
  typeof SharedFamilyTreeArrayResponseSchema
>;

type SharedFamilyTreeUsersArrayResponseType = z.infer<
  typeof SharedFamilyTreeUsersArrayResponseSchema
>;

export {
  SharedFamilyTreeResponseSchema,
  type SharedFamilyTreeResponseType,
  SharedFamilyTreeArrayResponseSchema,
  type SharedFamilyTreeArrayResponseType,
  SharedFamilyTreeUsersArrayResponseSchema,
  type SharedFamilyTreeUsersArrayResponseType,
};
