import {
  FamilyTreeMemberConnectionEnum,
  FCMTokenDeviceEnum,
  UserGenderEnum,
} from '@family-tree/shared';
import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// enums
export const DrizzleRealUserGenderEnum = pgEnum('real_user_gender', [
  UserGenderEnum.MALE,
  UserGenderEnum.FEMALE,
  UserGenderEnum.UNKNOWN,
]);
export const DrizzleMockMemberGenderEnum = pgEnum('mock_user_gender', [
  UserGenderEnum.MALE,
  UserGenderEnum.FEMALE,
]);
export const DrizzleFCMTokenDeviceEnum = pgEnum('fcm_token_device_type', [
  FCMTokenDeviceEnum.ANDROID,
  FCMTokenDeviceEnum.IOS,
  FCMTokenDeviceEnum.WEB,
]);
export const DrizzleFamilyTreeMemberConnectionEnum = pgEnum(
  'family_tree_member_connection',
  [
    FamilyTreeMemberConnectionEnum.SPOUSE,
    FamilyTreeMemberConnectionEnum.PARENT,
  ],
);

// schemas
const baseSchema = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'date', withTimezone: true }),
};

export const usersSchema = pgTable('users', {
  email: text('email').unique(),
  username: text('username'),
  name: text('name').notNull(),
  image: text('image'),
  gender: DrizzleRealUserGenderEnum('gender').notNull(),
  description: text('description'),
  dob: date('dob', { mode: 'string' }),
  dod: date('dod', { mode: 'string' }),
  ...baseSchema,
});

export const mockMembersSchema = pgTable('mock_users', {
  familyTreeId: uuid('family_tree_id').references(() => familyTreesSchema.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  image: text('image'),
  gender: DrizzleMockMemberGenderEnum('gender').notNull(),
  description: text('description'),
  dob: date('dob', { mode: 'string' }),
  dod: date('dod', { mode: 'string' }),
  ...baseSchema,
});

export const familyTreesSchema = pgTable(
  'family_trees',
  {
    name: text('name').notNull(),
    createdBy: uuid('created_by')
      .references(() => usersSchema.id)
      .notNull(),
    image: text('image'),
    public: boolean('public').default(false).notNull(),
    ...baseSchema,
  },
  (table) => ({
    nameAndUserIdx: unique('name_and_user_idx').on(table.name, table.createdBy),
  }),
);

export const familyTreeMembersSchema = pgTable('family_tree_members', {
  familyTreeId: uuid('family_tree_id')
    .references(() => familyTreesSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  realUserId: uuid('real_user_id').references(() => usersSchema.id),
  mockMemberId: uuid('mock_user_id')
    .references(() => mockMembersSchema.id)
    .notNull(),
  ...baseSchema,
});

export const familyTreeMemberConnectionsSchema = pgTable(
  'family_tree_member_connections',
  {
    familyTreeId: uuid('family_tree_id')
      .references(() => familyTreesSchema.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    fromUserId: uuid('from_user_id')
      .references(() => usersSchema.id)
      .notNull(),
    toUserId: uuid('to_user_id')
      .references(() => usersSchema.id)
      .notNull(),
    type: DrizzleFamilyTreeMemberConnectionEnum('type').notNull(),
    ...baseSchema,
  },
);

export const FCMTokensSchema = pgTable('fcm_tokens', {
  token: text('token').notNull(),
  userId: uuid('user_id')
    .references(() => usersSchema.id)
    .notNull(),
  deviceType: DrizzleFCMTokenDeviceEnum('device_type').notNull(),
  ...baseSchema,
});

export const notificationsSchema = pgTable('notifications', {
  content: text('content').notNull(),
  receiverUserId: uuid('receiver_user_id')
    .references(() => usersSchema.id)
    .notNull(),
  senderUserId: uuid('sender_user_id')
    .references(() => usersSchema.id)
    .notNull(),
  ...baseSchema,
});

export const notificationReadsSchema = pgTable('notification_reads', {
  userId: uuid('user_id')
    .references(() => usersSchema.id)
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// relations
export const usersRelations = relations(usersSchema, ({ many }) => ({
  familyTrees: many(familyTreesSchema, { relationName: 'family-tree-creator' }),
  familyTreeMembers: many(familyTreeMembersSchema, {
    relationName: 'user-family-tree-member',
  }),
  fcmTokens: many(FCMTokensSchema, { relationName: 'user-fcm-token' }),
}));

export const familyTreesRelations = relations(
  familyTreesSchema,
  ({ one, many }) => ({
    creator: one(usersSchema, {
      fields: [familyTreesSchema.createdBy],
      references: [usersSchema.id],
      relationName: 'family-tree-creator',
    }),
    familyTreeMembers: many(familyTreeMembersSchema, {
      relationName: 'family-tree-member',
    }),
    familyTreeMemberConnections: many(familyTreeMemberConnectionsSchema, {
      relationName: 'family-tree-member-connection',
    }),
  }),
);

export const familyTreeMembersRelations = relations(
  familyTreeMembersSchema,
  ({ one }) => ({
    realUser: one(usersSchema, {
      fields: [familyTreeMembersSchema.realUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-member-real-user',
    }),
    mockMember: one(mockMembersSchema, {
      fields: [familyTreeMembersSchema.mockMemberId],
      references: [mockMembersSchema.id],
      relationName: 'family-tree-member-mock-user',
    }),
    familyTree: one(familyTreesSchema, {
      fields: [familyTreeMembersSchema.familyTreeId],
      references: [familyTreesSchema.id],
      relationName: 'family-tree-member-family-tree',
    }),
  }),
);

export const familyTreeMemberConnectionsRelations = relations(
  familyTreeMemberConnectionsSchema,
  ({ one }) => ({
    fromUser: one(usersSchema, {
      fields: [familyTreeMemberConnectionsSchema.fromUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-member-connection-from-user',
    }),
    toUser: one(usersSchema, {
      fields: [familyTreeMemberConnectionsSchema.toUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-member-connection-to-user',
    }),
    familyTree: one(familyTreesSchema, {
      fields: [familyTreeMemberConnectionsSchema.familyTreeId],
      references: [familyTreesSchema.id],
      relationName: 'family-tree-member-connection-family-tree',
    }),
  }),
);

export const FCMTokensRelations = relations(FCMTokensSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [FCMTokensSchema.userId],
    references: [usersSchema.id],
    relationName: 'user-fcm-token',
  }),
}));

export const notificationsRelations = relations(
  notificationsSchema,
  ({ one }) => ({
    sender: one(usersSchema, {
      fields: [notificationsSchema.senderUserId],
      references: [usersSchema.id],
    }),
    receiver: one(usersSchema, {
      fields: [notificationsSchema.receiverUserId],
      references: [usersSchema.id],
    }),
  }),
);

export const notificationReadsRelations = relations(
  notificationReadsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [notificationReadsSchema.userId],
      references: [usersSchema.id],
    }),
  }),
);
