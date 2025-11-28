import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http.filter';
import { ZodSerializerInterceptorCustom } from './common/interceptors/zod.response.interceptor';
import { RedisCacheModule } from './config/cache/cache.module';
import { CookiesModule } from './config/cookies/cookies.module';
import { EnvModule } from './config/env/env.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamilyTreeModule } from './modules/family-tree/family-tree.module';
import { FamilyTreeMemberModule } from './modules/family-tree-member/family-tree-member.module';
import { FamilyTreeMemberConnectionModule } from './modules/family-tree-member-connection/family-tree-member-connection.module';
import { FCMTokenModule } from './modules/fcm-token/fcm-token.module';
import { FileModule } from './modules/file/file.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 3,
        },
      ],
    }),
    RedisCacheModule,
    AuthModule,
    UserModule,
    EnvModule,
    CookiesModule,
    FCMTokenModule,
    FamilyTreeModule,
    FamilyTreeMemberConnectionModule,
    FamilyTreeMemberModule,
    FileModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptorCustom },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
