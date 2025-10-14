import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeController],
  providers: [FamilyTreeService],
})
export class FamilyTreeModule {}
