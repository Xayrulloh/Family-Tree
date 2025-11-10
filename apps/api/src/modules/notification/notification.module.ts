import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [DrizzleModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
