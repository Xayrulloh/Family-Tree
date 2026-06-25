import { UserGenderEnum } from '@family-tree/shared';
import { randomUUID } from 'node:crypto';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '~/database/schema';

type UserInsert = typeof schema.usersSchema.$inferInsert;

export async function seedUser(
  db: NodePgDatabase<typeof schema>,
  overrides: Partial<UserInsert> = {},
) {
  const uid = randomUUID();
  const [user] = await db
    .insert(schema.usersSchema)
    .values({
      email: `user-${uid}@test.com`,
      name: 'Test User',
      username: `testuser-${uid}`,
      gender: UserGenderEnum.MALE,
      image: null,
      ...overrides,
    })
    .returning();
  return user;
}
