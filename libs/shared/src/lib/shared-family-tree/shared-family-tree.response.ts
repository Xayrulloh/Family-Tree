import type { z } from 'zod';
import {
  FamilyTreeSchema,
  SharedFamilyTreeSchema,
  UserSchema,
} from '../schema';

const SharedFamilyTreeResponseSchema = FamilyTreeSchema.omit({
  id: true,
}).merge(
  SharedFamilyTreeSchema.pick({
    familyTreeId: true,
    userId: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    isBlocked: true,
  }),
);

const SharedFamilyTreeArrayResponseSchema =
  SharedFamilyTreeResponseSchema.array();

const SharedFamilyTreeUserResponseSchema = UserSchema.merge(
  SharedFamilyTreeSchema.pick({
    familyTreeId: true,
    userId: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    isBlocked: true,
  }),
);

const SharedFamilyTreeUsersArrayResponseSchema =
  SharedFamilyTreeUserResponseSchema.array();

type SharedFamilyTreeResponseType = z.infer<
  typeof SharedFamilyTreeResponseSchema
>;

type SharedFamilyTreeArrayResponseType = z.infer<
  typeof SharedFamilyTreeArrayResponseSchema
>;

type SharedFamilyTreeUserResponseType = z.infer<
  typeof SharedFamilyTreeUserResponseSchema
>;

type SharedFamilyTreeUsersArrayResponseType = z.infer<
  typeof SharedFamilyTreeUsersArrayResponseSchema
>;

export {
  SharedFamilyTreeResponseSchema,
  type SharedFamilyTreeResponseType,
  SharedFamilyTreeArrayResponseSchema,
  type SharedFamilyTreeArrayResponseType,
  SharedFamilyTreeUserResponseSchema,
  type SharedFamilyTreeUserResponseType,
  SharedFamilyTreeUsersArrayResponseSchema,
  type SharedFamilyTreeUsersArrayResponseType,
};
