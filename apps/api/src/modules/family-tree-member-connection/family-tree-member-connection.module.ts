import { Module } from '@nestjs/common';
import { FamilyTreeAccessGuard } from '~/common/guards/family-tree-access.guard';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberConnectionController } from './family-tree-member-connection.controller';
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FamilyTreeMemberConnectionController],
  providers: [FamilyTreeMemberConnectionService, FamilyTreeAccessGuard],
})
export class FamilyTreeMemberConnectionModule {}
