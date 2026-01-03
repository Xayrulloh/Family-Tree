import { Module } from '@nestjs/common';
import { DrizzleModule } from '~/database/drizzle.module';
import { SharedFamilyTreeController } from './shared-family-tree.controller';
import { SharedFamilyTreeService } from './shared-family-tree.service';

@Module({
  imports: [DrizzleModule],
  controllers: [SharedFamilyTreeController],
  providers: [SharedFamilyTreeService],
})
export class SharedFamilyTreeModule {}
