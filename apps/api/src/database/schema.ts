import {
  FamilyTreeConnectionEnum,
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
export const DrizzleMockUserGenderEnum = pgEnum('mock_user_gender', [
  UserGenderEnum.MALE,
  UserGenderEnum.FEMALE,
]);
export const DrizzleFCMTokenDeviceEnum = pgEnum('fcm_token_device_type', [
  FCMTokenDeviceEnum.ANDROID,
  FCMTokenDeviceEnum.IOS,
  FCMTokenDeviceEnum.WEB,
]);
export const DrizzleFamilyTreeConnectionEnum = pgEnum(
  'family_tree_connection',
  [FamilyTreeConnectionEnum.SPOUSE, FamilyTreeConnectionEnum.CHILD],
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

export const mockUsersSchema = pgTable('mock_users', {
  familyTreeId: uuid('family_tree_id').references(() => familyTreesSchema.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  image: text('image'),
  gender: DrizzleMockUserGenderEnum('gender').notNull(),
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

export const familyTreeNodesSchema = pgTable('family_tree_nodes', {
  familyTreeId: uuid('family_tree_id')
    .references(() => familyTreesSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  realUserId: uuid('real_user_id').references(() => usersSchema.id),
  mockUserId: uuid('mock_user_id')
    .references(() => mockUsersSchema.id)
    .notNull(),
  ...baseSchema,
});

export const familyTreeConnectionsSchema = pgTable('family_tree_connections', {
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
  connectionType: DrizzleFamilyTreeConnectionEnum('connection_type').notNull(),
  ...baseSchema,
});

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
  familyTreeNodes: many(familyTreeNodesSchema, {
    relationName: 'user-family-tree-node',
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
    familyTreeNodes: many(familyTreeNodesSchema, {
      relationName: 'family-tree-node',
    }),
    familyTreeConnections: many(familyTreeConnectionsSchema, {
      relationName: 'family-tree-connection',
    }),
  }),
);

export const familyTreeNodesRelations = relations(
  familyTreeNodesSchema,
  ({ one }) => ({
    realUser: one(usersSchema, {
      fields: [familyTreeNodesSchema.realUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-node-real-user',
    }),
    mockUser: one(mockUsersSchema, {
      fields: [familyTreeNodesSchema.mockUserId],
      references: [mockUsersSchema.id],
      relationName: 'family-tree-node-mock-user',
    }),
    familyTree: one(familyTreesSchema, {
      fields: [familyTreeNodesSchema.familyTreeId],
      references: [familyTreesSchema.id],
      relationName: 'family-tree-node-family-tree',
    }),
  }),
);

export const familyTreeConnectionsRelations = relations(
  familyTreeConnectionsSchema,
  ({ one }) => ({
    fromUser: one(usersSchema, {
      fields: [familyTreeConnectionsSchema.fromUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-connection-from-user',
    }),
    toUser: one(usersSchema, {
      fields: [familyTreeConnectionsSchema.toUserId],
      references: [usersSchema.id],
      relationName: 'family-tree-connection-to-user',
    }),
    familyTree: one(familyTreesSchema, {
      fields: [familyTreeConnectionsSchema.familyTreeId],
      references: [familyTreesSchema.id],
      relationName: 'family-tree-connection-family-tree',
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
