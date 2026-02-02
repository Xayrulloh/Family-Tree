import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FamilyTreeCacheInterceptor } from '../../common/interceptors/family-tree.cache.interceptor';
import { UserCacheInterceptor } from '../../common/interceptors/user.cache.interceptor';
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
  providers: [CacheService, FamilyTreeCacheInterceptor, UserCacheInterceptor],
  exports: [CacheService, FamilyTreeCacheInterceptor, UserCacheInterceptor],
})
export class RedisCacheModule {}
