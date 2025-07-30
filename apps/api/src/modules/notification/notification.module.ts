import { Module } from '@nestjs/common';
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import { DrizzleModule } from '~/database/drizzle.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [DrizzleModule],
  controllers: [NotificationController],
  providers: [NotificationService, CloudflareConfig],
})
export class NotificationModule {}
