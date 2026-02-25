import type { z } from 'zod';
import { PaginationResponseSchema } from '../pagination';
import {
  FamilyTreeSchema,
  SharedFamilyTreeSchema,
  UserSchema,
} from '../schema';

const SharedFamilyTreeResponseSchema = FamilyTreeSchema.omit({
  id: true,
  isPublic: true,
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

const SharedFamilyTreePaginationResponseSchema =
  PaginationResponseSchema.extend({
    sharedFamilyTrees: SharedFamilyTreeResponseSchema.array(),
  });

const SharedFamilyTreeUserResponseSchema = UserSchema.omit({
  id: true,
  username: true,
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

const SharedFamilyTreeUsersPaginationResponseSchema =
  PaginationResponseSchema.extend({
    sharedFamilyTreeUsers: SharedFamilyTreeUserResponseSchema.array(),
  });

type SharedFamilyTreeResponseType = z.infer<
  typeof SharedFamilyTreeResponseSchema
>;

type SharedFamilyTreePaginationResponseType = z.infer<
  typeof SharedFamilyTreePaginationResponseSchema
>;

type SharedFamilyTreeUserResponseType = z.infer<
  typeof SharedFamilyTreeUserResponseSchema
>;

type SharedFamilyTreeUsersPaginationResponseType = z.infer<
  typeof SharedFamilyTreeUsersPaginationResponseSchema
>;

export {
  SharedFamilyTreeResponseSchema,
  type SharedFamilyTreeResponseType,
  SharedFamilyTreePaginationResponseSchema,
  type SharedFamilyTreePaginationResponseType,
  SharedFamilyTreeUserResponseSchema,
  type SharedFamilyTreeUserResponseType,
  SharedFamilyTreeUsersPaginationResponseSchema,
  type SharedFamilyTreeUsersPaginationResponseType,
};
