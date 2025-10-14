import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberConnectionController } from './family-tree-member-connection.controller';
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  controllers: [FamilyTreeMemberConnectionController],
  providers: [FamilyTreeMemberConnectionService],
})
export class FamilyTreeMemberConnectionModule {}
