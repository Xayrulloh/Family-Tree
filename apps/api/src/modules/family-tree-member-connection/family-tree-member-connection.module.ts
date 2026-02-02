import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { SharedFamilyTreeService } from '../shared-family-tree/shared-family-tree.service';
import { FamilyTreeMemberConnectionController } from './family-tree-member-connection.controller';
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FamilyTreeMemberConnectionController],
  providers: [FamilyTreeMemberConnectionService, SharedFamilyTreeService],
})
export class FamilyTreeMemberConnectionModule {}
