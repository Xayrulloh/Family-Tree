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
export const DrizzleUserGenderEnum = pgEnum('user_gender', [
  UserGenderEnum.MALE,
  UserGenderEnum.FEMALE,
  UserGenderEnum.UNKNOWN,
]);
export const DrizzlememberGenderEnum = pgEnum('member_gender', [
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
  email: text('email').unique().notNull(),
  username: text('username').notNull(),
  name: text('name').notNull(),
  image: text('image'),
  gender: DrizzleUserGenderEnum('gender').notNull(),
  description: text('description'),
  dob: date('dob', { mode: 'string' }),
  dod: date('dod', { mode: 'string' }),
  ...baseSchema,
});

export const membersSchema = pgTable('members', {
  name: text('name').notNull(),
  image: text('image'),
  gender: DrizzlememberGenderEnum('gender').notNull(),
  description: text('description'),
  dob: date('dob', { mode: 'string' }),
  dod: date('dod', { mode: 'string' }),
  familyTreeId: uuid('family_tree_id')
    .references(() => familyTreesSchema.id, { onDelete: 'cascade' })
    .notNull(),
  ...baseSchema,
});

export const familyTreesSchema = pgTable(
  'family_trees',
  {
    name: text('name').notNull(),
    createdBy: uuid('created_by')
      .references(() => usersSchema.id, {
        onDelete: 'cascade',
      })
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
  memberId: uuid('member_id')
    .references(() => membersSchema.id, {
      onDelete: 'cascade',
    })
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
    fromMemberId: uuid('from_member_id')
      .references(() => membersSchema.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    toMemberId: uuid('to_member_id')
      .references(() => membersSchema.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    type: DrizzleFamilyTreeMemberConnectionEnum('type').notNull(),
    ...baseSchema,
  },
);

export const FCMTokensSchema = pgTable('fcm_tokens', {
  token: text('token').notNull(),
  userId: uuid('user_id')
    .references(() => usersSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  deviceType: DrizzleFCMTokenDeviceEnum('device_type').notNull(),
  ...baseSchema,
});

export const notificationsSchema = pgTable('notifications', {
  content: text('content').notNull(),
  receiverUserId: uuid('receiver_user_id')
    .references(() => usersSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  senderUserId: uuid('sender_user_id')
    .references(() => usersSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  ...baseSchema,
});

export const notificationReadsSchema = pgTable('notification_reads', {
  userId: uuid('user_id')
    .references(() => usersSchema.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// relations
export const usersRelations = relations(usersSchema, ({ many }) => ({
  familyTrees: many(familyTreesSchema, { relationName: 'family-tree-creator' }),
  fcmTokens: many(FCMTokensSchema, { relationName: 'user-fcm-token' }),
  sentNotifications: many(notificationsSchema, { relationName: 'sender' }),
  receivedNotifications: many(notificationsSchema, {
    relationName: 'receiver',
  }),
  notificationReads: many(notificationReadsSchema),
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

export const membersRelations = relations(membersSchema, ({ many }) => ({
  familyTreeMembers: many(familyTreeMembersSchema, {
    relationName: 'family-tree-member',
  }),
  fromConnections: many(familyTreeMemberConnectionsSchema, {
    relationName: 'family-tree-member-connection-from-member',
  }),
  toConnections: many(familyTreeMemberConnectionsSchema, {
    relationName: 'family-tree-member-connection-to-member',
  }),
}));

export const familyTreeMembersRelations = relations(
  familyTreeMembersSchema,
  ({ one }) => ({
    member: one(membersSchema, {
      fields: [familyTreeMembersSchema.memberId],
      references: [membersSchema.id],
      relationName: 'family-tree-member',
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
    fromMember: one(membersSchema, {
      fields: [familyTreeMemberConnectionsSchema.fromMemberId],
      references: [membersSchema.id],
      relationName: 'family-tree-member-connection-from-member',
    }),
    toMember: one(membersSchema, {
      fields: [familyTreeMemberConnectionsSchema.toMemberId],
      references: [membersSchema.id],
      relationName: 'family-tree-member-connection-to-member',
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
      relationName: 'sender',
    }),
    receiver: one(usersSchema, {
      fields: [notificationsSchema.receiverUserId],
      references: [usersSchema.id],
      relationName: 'receiver',
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
