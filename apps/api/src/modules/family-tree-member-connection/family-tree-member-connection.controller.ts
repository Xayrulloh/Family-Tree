import { FamilyTreeMemberConnectionGetAllResponseSchema } from '@family-tree/shared';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { CacheService } from '~/config/cache/cache.service';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from '../shared-family-tree/shared-family-tree.service';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
} from './dto/family-tree-member-connection.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@ApiTags('Family Tree Member Connection')
@ApiParam({ name: 'familyTreeId', required: true, type: String })
@Controller('family-trees/:familyTreeId/members')
export class FamilyTreeMemberConnectionController {
  constructor(
    private readonly familyTreeMemberConnectionService: FamilyTreeMemberConnectionService,
    private readonly cacheService: CacheService,
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
  ) {}

  // get all connections of tree
  @Get('connections')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getAllFamilyTreeMemberConnections(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberConnectionGetAllParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
    );

    const cachedFamilyTreeMemberConnections =
      await this.cacheService.get<FamilyTreeMemberConnectionGetAllResponseDto>(
        `family-trees:${param.familyTreeId}:members:connections`,
      );

    if (cachedFamilyTreeMemberConnections) {
      return cachedFamilyTreeMemberConnections;
    }

    const familyTreeMemberConnections =
      await this.familyTreeMemberConnectionService.getAllFamilyTreeMemberConnections(
        param,
      );

    this.cacheService.set(
      `family-trees:${param.familyTreeId}:members:connections`,
      familyTreeMemberConnections,
    );

    return familyTreeMemberConnections;
  }

  // get connection of member in tree
  @Get(':memberUserId/connections')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'memberUserId', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getFamilyTreeMemberConnections(
    @Param() param: FamilyTreeMemberConnectionGetByMemberParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    const cachedFamilyTreeMemberConnections =
      await this.cacheService.get<FamilyTreeMemberConnectionGetAllResponseDto>(
        `family-trees:${param.familyTreeId}:members:${param.memberUserId}:connections`,
      );

    if (cachedFamilyTreeMemberConnections) {
      return cachedFamilyTreeMemberConnections;
    }

    const familyTreeMemberConnections =
      await this.familyTreeMemberConnectionService.getFamilyTreeMemberConnections(
        param,
      );

    this.cacheService.set(
      `family-trees:${param.familyTreeId}:members:${param.memberUserId}:connections`,
      familyTreeMemberConnections,
    );

    return familyTreeMemberConnections;
  }
}
