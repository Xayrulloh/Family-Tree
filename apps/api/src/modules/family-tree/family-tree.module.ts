import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberService } from '../family-tree-member/services/family-tree-member.service';
import { FamilyTreeOwnerController } from './controllers/family-tree.controller';
import { FamilyTreePublicController } from './controllers/family-tree-public.controller';
import { FamilyTreeSharedController } from './controllers/family-tree-shared.controller';
import { FamilyTreeService } from './services/family-tree.service';
import { FamilyTreeSharedService } from './services/shared-family-tree.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  // Public/shared before owner so literal segments resolve before :id
  controllers: [
    FamilyTreePublicController,
    FamilyTreeSharedController,
    FamilyTreeOwnerController,
  ],
  providers: [
    FamilyTreeService,
    FamilyTreeSharedService,
    FamilyTreeMemberService,
  ],
  exports: [FamilyTreeService],
})
export class FamilyTreeModule {}
