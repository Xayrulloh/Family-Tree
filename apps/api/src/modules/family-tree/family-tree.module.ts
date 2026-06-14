import { Module } from '@nestjs/common';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeController],
  providers: [
    FamilyTreeService,
    FamilyTreeMemberService,
    OwnerGuard,
    PublicGuard,
  ],
})
export class FamilyTreeModule {}
