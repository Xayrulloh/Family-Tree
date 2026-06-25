import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '~/database/schema';

let _db: NodePgDatabase<typeof schema> | undefined;
let _pool: Pool | undefined;

export function getTestDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    _pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    // Suppress connection-terminated errors emitted when the container stops during teardown
    _pool.on('error', () => {});
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export async function truncateTables(): Promise<void> {
  if (!_pool) getTestDb();
  const pool = _pool as Pool;

  await pool.query(`
    TRUNCATE TABLE
      notification_reads,
      notifications,
      fcm_tokens,
      family_tree_member_connections,
      family_tree_members,
      shared_family_trees,
      family_trees,
      users
    CASCADE
  `);
}
