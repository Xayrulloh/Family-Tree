import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudflareConfig } from './cloudflare.config';

@Module({
  providers: [ConfigService],
  exports: [CloudflareConfig],
})
export class CloudflareModule {}
