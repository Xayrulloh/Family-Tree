import { Module } from '@nestjs/common';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { DrizzleModule } from '~/database/drizzle.module';
import { ConnectionController } from './controllers/connection.controller';
import { ConnectionPublicController } from './controllers/connection-public.controller';
import { ConnectionSharedController } from './controllers/connection-shared.controller';
import { FamilyTreeMemberConnectionService } from './services/family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  // Public/shared before owner so literal prefix segments resolve before :familyTreeId
  controllers: [
    ConnectionPublicController,
    ConnectionSharedController,
    ConnectionController,
  ],
  providers: [
    FamilyTreeMemberConnectionService,
    OwnerGuard,
    PublicGuard,
    SharedAccessGuard,
  ],
})
export class FamilyTreeMemberConnectionModule {}
