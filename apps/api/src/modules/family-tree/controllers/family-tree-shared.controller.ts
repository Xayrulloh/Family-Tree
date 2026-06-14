import {
  SharedFamilyTreePaginationResponseSchema,
  SharedFamilyTreeResponseSchema,
  SharedFamilyTreeUsersPaginationResponseSchema,
} from '@family-tree/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { RequirePermission } from '~/common/decorators/require-permission.decorator';
import { FamilyTreeAccessGuard } from '~/common/guards/family-tree-access.guard';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  SharedFamilyTreeIdParamDto,
  SharedFamilyTreePaginationAndSearchQueryDto,
  SharedFamilyTreePaginationResponseDto,
  SharedFamilyTreeResponseDto,
  SharedFamilyTreeUpdateParamDto,
  SharedFamilyTreeUpdateRequestDto,
  SharedFamilyTreeUsersPaginationResponseDto,
} from '../dto/shared-family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from '../services/shared-family-tree.service';

@ApiTags('Family Tree (shared)')
@ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
@Controller('family-trees/shared')
@UseGuards(JWTAuthGuard)
export class FamilyTreeSharedController {
  constructor(
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
  ) {}

  // List trees shared with me
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SharedFamilyTreePaginationResponseDto })
  @ZodSerializerDto(SharedFamilyTreePaginationResponseSchema)
  async getSharedFamilyTrees(
    @Req() req: AuthenticatedRequest,
    @Query() query: SharedFamilyTreePaginationAndSearchQueryDto,
  ): Promise<SharedFamilyTreePaginationResponseDto> {
    return this.sharedFamilyTreeService.getSharedFamilyTrees(
      req.user.id,
      query,
    );
  }

  // Get single shared tree record (RBAC flags + tree metadata)
  @Get(':familyTreeId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SharedFamilyTreeResponseDto })
  @ZodSerializerDto(SharedFamilyTreeResponseSchema)
  async getSharedFamilyTreeById(
    @Req() req: AuthenticatedRequest,
    @Param() param: SharedFamilyTreeIdParamDto,
  ): Promise<SharedFamilyTreeResponseDto> {
    return this.sharedFamilyTreeService.getSharedFamilyTreeById(
      req.user.id,
      param.familyTreeId,
    );
  }

  // Users who have access to a tree (owner-only, guarded by OwnerGuard inside FamilyTreeAccessGuard)
  @Get(':familyTreeId/users')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SharedFamilyTreeUsersPaginationResponseDto })
  @ZodSerializerDto(SharedFamilyTreeUsersPaginationResponseSchema)
  async getSharedFamilyTreeUsersById(
    @Req() req: AuthenticatedRequest,
    @Param() param: SharedFamilyTreeIdParamDto,
    @Query() query: SharedFamilyTreePaginationAndSearchQueryDto,
  ): Promise<SharedFamilyTreeUsersPaginationResponseDto> {
    return this.sharedFamilyTreeService.getSharedFamilyTreeUsersById(
      req.user.id,
      param.familyTreeId,
      query,
    );
  }

  // Update RBAC for a shared user (owner or shared user with all perms)
  @Put(':familyTreeId/users/:userId')
  @UseGuards(FamilyTreeAccessGuard)
  @RequirePermission('canEditMembers', 'canAddMembers', 'canDeleteMembers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateSharedFamilyTreeById(
    @Param() param: SharedFamilyTreeUpdateParamDto,
    @Body() body: SharedFamilyTreeUpdateRequestDto,
  ): Promise<void> {
    return this.sharedFamilyTreeService.updateSharedFamilyTreeById(
      param.userId,
      param.familyTreeId,
      body,
    );
  }
}
