import { FamilyTreeMemberConnectionGetAllResponseSchema } from '@family-tree/shared';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { FamilyTreeAccessGuard } from '~/common/guards/family-tree-access.guard';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import { FamilyTreeCacheInterceptor } from '~/common/interceptors/family-tree.cache.interceptor';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  FamilyTreeMemberConnectionGetByMemberParamDto,
} from './dto/family-tree-member-connection.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@ApiTags('Family Tree Member Connection')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/:familyTreeId/members')
@UseGuards(JWTAuthGuard, FamilyTreeAccessGuard)
@UseInterceptors(FamilyTreeCacheInterceptor)
export class FamilyTreeMemberConnectionController {
  constructor(
    private readonly familyTreeMemberConnectionService: FamilyTreeMemberConnectionService,
  ) {}

  // get all connections of tree
  @Get('connections')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getAllFamilyTreeMemberConnections(
    @Param() param: FamilyTreeMemberConnectionGetAllParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.getAllFamilyTreeMemberConnections(
      param,
    );
  }

  // get connection of member in tree
  @Get(':memberUserId/connections')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getFamilyTreeMemberConnections(
    @Param() param: FamilyTreeMemberConnectionGetByMemberParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.getFamilyTreeMemberConnections(
      param,
    );
  }
}
