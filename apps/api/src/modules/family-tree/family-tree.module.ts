import { Module } from '@nestjs/common';
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeRelationshipService } from '../family-tree-relationship/family-tree-relationship.service';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FamilyTreeController],
  providers: [
    FamilyTreeService,
    FamilyTreeRelationshipService,
    CloudflareConfig,
  ],
})
export class FamilyTreeModule {}
