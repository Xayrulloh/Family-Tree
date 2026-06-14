import { Module } from '@nestjs/common';
import { FamilyTreeAccessGuard } from '~/common/guards/family-tree-access.guard';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberController } from './family-tree-member.controller';
import { FamilyTreeMemberService } from './family-tree-member.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeMemberController],
  providers: [FamilyTreeMemberService, FamilyTreeAccessGuard],
})
export class FamilyTreeMemberModule {}
