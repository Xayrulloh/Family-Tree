import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberOwnerController } from './controllers/member.controller';
import { FamilyTreeMemberPublicController } from './controllers/member-public.controller';
import { FamilyTreeMemberSharedController } from './controllers/member-shared.controller';
import { FamilyTreeMemberService } from './services/family-tree-member.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  // Public/shared before owner so literal prefix segments resolve before :familyTreeId
  controllers: [
    FamilyTreeMemberPublicController,
    FamilyTreeMemberSharedController,
    FamilyTreeMemberOwnerController,
  ],
  providers: [FamilyTreeMemberService],
  exports: [FamilyTreeMemberService],
})
export class FamilyTreeMemberModule {}
