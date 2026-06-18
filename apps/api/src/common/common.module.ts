import { Global, Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { FamilyTreeAccessGuard } from './guards/family-tree-access.guard';
import { OwnerGuard } from './guards/owner.guard';
import { PublicGuard } from './guards/public.guard';
import { SharedAccessGuard } from './guards/shared-access.guard';

@Global()
@Module({
  imports: [DrizzleModule],
  providers: [
    OwnerGuard,
    PublicGuard,
    SharedAccessGuard,
    FamilyTreeAccessGuard,
  ],
  exports: [OwnerGuard, PublicGuard, SharedAccessGuard, FamilyTreeAccessGuard],
})
export class CommonModule {}
