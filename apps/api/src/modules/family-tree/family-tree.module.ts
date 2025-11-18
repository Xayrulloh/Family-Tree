import { Module } from '@nestjs/common';
import { CloudflareModule } from '~/config/cloudflare/cloudflare.module';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
import { FamilyTreeMemberConnectionService } from '../family-tree-member-connection/family-tree-member-connection.service';
import { FamilyTreeController } from './family-tree.controller';
import { FamilyTreeService } from './family-tree.service';

@Module({
  imports: [DrizzleModule, CloudflareModule],
  controllers: [FamilyTreeController],
  providers: [
    FamilyTreeService,
    FamilyTreeMemberService,
    FamilyTreeMemberConnectionService,
  ],
})
export class FamilyTreeModule {}
