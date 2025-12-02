import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { EnvType } from '../env/env-validation';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          stores: [
            createKeyv(config.getOrThrow<EnvType['REDIS_URL']>('REDIS_URL')),
          ],
          ttl: config.getOrThrow<EnvType['REDIS_TTL']>('REDIS_TTL'),
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule {}
