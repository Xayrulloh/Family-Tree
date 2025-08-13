import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { FCMTokenController } from './fcm-token.controller';
import { FCMTokenService } from './fcm-token.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FCMTokenController],
  providers: [FCMTokenService],
})
export class FCMTokenModule {}
