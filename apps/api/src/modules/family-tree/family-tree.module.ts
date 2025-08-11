import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeRelationshipService } from '../family-tree-relationship/family-tree-relationship.service';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeController],
  providers: [FamilyTreeService, FamilyTreeRelationshipService],
})
export class FamilyTreeModule {}
