import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeNodeController } from './family-tree-node.controller';
import { FamilyTreeNodeService } from './family-tree-node.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeNodeController],
  providers: [FamilyTreeNodeService],
})
export class FamilyTreeNodeModule {}
