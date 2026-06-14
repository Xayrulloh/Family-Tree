import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger/dist/decorators';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { FamilyTreeCacheInterceptor } from '~/common/interceptors/family-tree.cache.interceptor';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import {
  BaseFamilyTreeMemberReadController,
  BaseFamilyTreeMemberWriteController,
} from './family-tree-member.base.controller';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from './family-tree-member.service';

// OWNER — bare path, full read + write
@ApiTags('Family Tree Member')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/:familyTreeId/members')
@UseGuards(JWTAuthGuard, OwnerGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class FamilyTreeMemberController extends BaseFamilyTreeMemberWriteController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(familyTreeMemberService: FamilyTreeMemberService) {
    super(familyTreeMemberService);
  }
}

// SHARED — /shared path, read + write gated by RBAC flags
@ApiTags('Family Tree Member (shared)')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/:familyTreeId/shared/members')
@UseGuards(JWTAuthGuard, SharedAccessGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class SharedFamilyTreeMemberController extends BaseFamilyTreeMemberWriteController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(familyTreeMemberService: FamilyTreeMemberService) {
    super(familyTreeMemberService);
  }
}

// PUBLIC — /public path, read only, no auth required
@ApiTags('Family Tree Member (public)')
@Controller('family-trees/:familyTreeId/public/members')
@UseGuards(PublicGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class PublicFamilyTreeMemberController extends BaseFamilyTreeMemberReadController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(familyTreeMemberService: FamilyTreeMemberService) {
    super(familyTreeMemberService);
  }
}
