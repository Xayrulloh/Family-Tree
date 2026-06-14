import { Module } from '@nestjs/common';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { MemberController } from './controllers/member.controller';
import { MemberPublicController } from './controllers/member-public.controller';
import { MemberSharedController } from './controllers/member-shared.controller';
import { FamilyTreeMemberService } from './services/family-tree-member.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  // Public/shared before owner so literal prefix segments resolve before :familyTreeId
  controllers: [
    MemberPublicController,
    MemberSharedController,
    MemberController,
  ],
  providers: [
    FamilyTreeMemberService,
    OwnerGuard,
    PublicGuard,
    SharedAccessGuard,
  ],
  exports: [FamilyTreeMemberService],
})
export class FamilyTreeMemberModule {}
