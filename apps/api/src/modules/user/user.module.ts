import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
