import type { z } from 'zod';
import { PaginationResponseSchema } from '../pagination';
import {
  FamilyTreeSchema,
  FamilyTreeSharedSchema,
  UserSchema,
} from '../schema';

const FamilyTreeSharedResponseSchema = FamilyTreeSchema.omit({
  id: true,
  isPublic: true,
}).merge(
  FamilyTreeSharedSchema.pick({
    familyTreeId: true,
    userId: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    isBlocked: true,
  }),
);

const FamilyTreeSharedPaginationResponseSchema =
  PaginationResponseSchema.extend({
    sharedFamilyTrees: FamilyTreeSharedResponseSchema.array(),
  });

const FamilyTreeSharedUserResponseSchema = UserSchema.omit({
  id: true,
  username: true,
}).merge(
  FamilyTreeSharedSchema.pick({
    familyTreeId: true,
    userId: true,
    canAddMembers: true,
    canEditMembers: true,
    canDeleteMembers: true,
    isBlocked: true,
  }),
);

const FamilyTreeSharedUsersPaginationResponseSchema =
  PaginationResponseSchema.extend({
    sharedFamilyTreeUsers: FamilyTreeSharedUserResponseSchema.array(),
  });

type FamilyTreeSharedResponseType = z.infer<
  typeof FamilyTreeSharedResponseSchema
>;

type FamilyTreeSharedPaginationResponseType = z.infer<
  typeof FamilyTreeSharedPaginationResponseSchema
>;

type FamilyTreeSharedUserResponseType = z.infer<
  typeof FamilyTreeSharedUserResponseSchema
>;

type FamilyTreeSharedUsersPaginationResponseType = z.infer<
  typeof FamilyTreeSharedUsersPaginationResponseSchema
>;

export {
  FamilyTreeSharedPaginationResponseSchema,
  type FamilyTreeSharedPaginationResponseType,
  FamilyTreeSharedResponseSchema,
  type FamilyTreeSharedResponseType,
  FamilyTreeSharedUserResponseSchema,
  type FamilyTreeSharedUserResponseType,
  FamilyTreeSharedUsersPaginationResponseSchema,
  type FamilyTreeSharedUsersPaginationResponseType,
};
