import { Module } from '@nestjs/common';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { DrizzleModule } from '~/database/drizzle.module';
import {
  FamilyTreeMemberConnectionController,
  PublicFamilyTreeMemberConnectionController,
  SharedFamilyTreeMemberConnectionController,
} from './family-tree-member-connection.controller';
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@Module({
  imports: [DrizzleModule],
  controllers: [
    FamilyTreeMemberConnectionController,
    SharedFamilyTreeMemberConnectionController,
    PublicFamilyTreeMemberConnectionController,
  ],
  providers: [
    FamilyTreeMemberConnectionService,
    OwnerGuard,
    PublicGuard,
    SharedAccessGuard,
  ],
})
export class FamilyTreeMemberConnectionModule {}
