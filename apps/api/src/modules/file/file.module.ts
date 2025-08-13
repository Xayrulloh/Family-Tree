import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
