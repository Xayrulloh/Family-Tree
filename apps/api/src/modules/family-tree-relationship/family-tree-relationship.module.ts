import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeRelationshipController } from './family-tree-relationship.controller';
import { FamilyTreeRelationshipService } from './family-tree-relationship.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeRelationshipController],
  providers: [FamilyTreeRelationshipService],
})
export class FamilyTreeRelationshipModule {}
