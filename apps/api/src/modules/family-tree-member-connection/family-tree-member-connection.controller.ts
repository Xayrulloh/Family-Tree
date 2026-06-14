import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger/dist/decorators';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { SharedAccessGuard } from '~/common/guards/shared-access.guard';
import { FamilyTreeCacheInterceptor } from '~/common/interceptors/family-tree.cache.interceptor';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import { BaseFamilyTreeMemberConnectionController } from './family-tree-member-connection.base.controller';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

// OWNER — bare path
@ApiTags('Family Tree Member Connection')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/:familyTreeId/members')
@UseGuards(JWTAuthGuard, OwnerGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class FamilyTreeMemberConnectionController extends BaseFamilyTreeMemberConnectionController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(service: FamilyTreeMemberConnectionService) {
    super(service);
  }
}

// SHARED — /shared path
@ApiTags('Family Tree Member Connection (shared)')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/:familyTreeId/shared/members')
@UseGuards(JWTAuthGuard, SharedAccessGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class SharedFamilyTreeMemberConnectionController extends BaseFamilyTreeMemberConnectionController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(service: FamilyTreeMemberConnectionService) {
    super(service);
  }
}

// PUBLIC — /public path, no auth required
@ApiTags('Family Tree Member Connection (public)')
@Controller('family-trees/:familyTreeId/public/members')
@UseGuards(PublicGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class PublicFamilyTreeMemberConnectionController extends BaseFamilyTreeMemberConnectionController {
  // biome-ignore lint/complexity/noUselessConstructor: <required for NestJS DI metadata on inherited controller>
  constructor(service: FamilyTreeMemberConnectionService) {
    super(service);
  }
}
