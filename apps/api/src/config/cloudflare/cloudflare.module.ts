import { Module } from '@nestjs/common';
import { CloudflareConfig } from './cloudflare.config';

@Module({
  providers: [CloudflareConfig],
  exports: [CloudflareConfig],
})
export class CloudflareModule {}
