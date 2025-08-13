import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
