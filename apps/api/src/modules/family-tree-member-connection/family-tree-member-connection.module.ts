import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeMemberConnectionOwnerController } from './controllers/connection.controller';
import { ConnectionPublicController } from './controllers/connection-public.controller';
import { ConnectionSharedController } from './controllers/connection-shared.controller';
import { FamilyTreeMemberConnectionService } from './services/family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  // Public/shared before owner so literal prefix segments resolve before :familyTreeId
  controllers: [
    ConnectionPublicController,
    ConnectionSharedController,
    FamilyTreeMemberConnectionOwnerController,
  ],
  providers: [FamilyTreeMemberConnectionService],
})
export class FamilyTreeMemberConnectionModule {}
