import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberController } from './family-tree-member.controller';
import { FamilyTreeMemberService } from './family-tree-member.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeMemberController],
  providers: [FamilyTreeMemberService],
})
export class FamilyTreeMemberModule {}
