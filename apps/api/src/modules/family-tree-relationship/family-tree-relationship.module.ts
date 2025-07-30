import { Module } from '@nestjs/common';
import { CloudflareConfig } from '~/config/cloudflare/cloudflare.config';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeRelationshipController } from './family-tree-relationship.controller';
import { FamilyTreeRelationshipService } from './family-tree-relationship.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FamilyTreeRelationshipController],
  providers: [FamilyTreeRelationshipService, CloudflareConfig],
})
export class FamilyTreeRelationshipModule {}
