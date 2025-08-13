import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { EnvType } from '~/config/env/env-validation';
import * as schema from '~/database/schema';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const connectionString = configService.get<EnvType['DATABASE_URL']>(
        'DATABASE_URL',
      ) as string;
      const pool = new Pool({
        connectionString,
      });

      Logger.log(`Database connected to ${process.env.DATABASE_URL}`);

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
