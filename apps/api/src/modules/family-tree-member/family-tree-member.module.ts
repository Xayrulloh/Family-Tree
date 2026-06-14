import { Module } from '@nestjs/common';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import {
  FamilyTreeMemberController,
  PublicFamilyTreeMemberController,
  SharedFamilyTreeMemberController,
} from './family-tree-member.controller';
import { FamilyTreeMemberService } from './family-tree-member.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [
    FamilyTreeMemberController,
    SharedFamilyTreeMemberController,
    PublicFamilyTreeMemberController,
  ],
  providers: [
    FamilyTreeMemberService,
    OwnerGuard,
    PublicGuard,
    SharedAccessGuard,
  ],
})
export class FamilyTreeMemberModule {}
