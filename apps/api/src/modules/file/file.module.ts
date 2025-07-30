import { Module } from '@nestjs/common';
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import { DrizzleModule } from '~/database/drizzle.module';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FileController],
  providers: [FileService, CloudflareConfig],
})
export class FileModule {}
