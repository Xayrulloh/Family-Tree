import { Module } from '@nestjs/common';
import { FamilyTreeAccessGuard } from '~/common/guards/family-tree-access.guard';
import { DrizzleModule } from '~/database/drizzle.module';
import { SharedFamilyTreeController } from './shared-family-tree.controller';
import { SharedFamilyTreeService } from './shared-family-tree.service';

@Module({
  imports: [DrizzleModule],
  controllers: [SharedFamilyTreeController],
  providers: [SharedFamilyTreeService, FamilyTreeAccessGuard],
})
export class SharedFamilyTreeModule {}
