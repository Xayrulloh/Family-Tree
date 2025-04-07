import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DrizzleModule } from '../../database/drizzle.module';
import { CloudflareConfig } from '../../config/cloudflare/cloudflare.config';

@Module({
  imports: [DrizzleModule],
  controllers: [NotificationController],
  providers: [NotificationService, CloudflareConfig],
})
export class NotificationModule {}
