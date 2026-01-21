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
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
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
} from './dto/shared-family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from './shared-family-tree.service';

@ApiTags('Shared Family Tree')
@Controller('family-trees')
export class SharedFamilyTreeController {
  constructor(
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
  ) {}

  // Find the shared family trees with user (trees which is shared with user)
  @Get('shared')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, default: 15 })
  @ApiQuery({ name: 'name', required: false, type: String })
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

  // Find the single shared family tree with user (tree which is shared with user but singular)
  @Get(':familyTreeId/shared')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'familyTreeId', required: true, type: String })
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

  // Find the users which is shared with (users which is accessing to the shared tree)
  @Get(':familyTreeId/shared-users')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'familyTreeId', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'perPage', required: false, type: Number, default: 15 })
  @ApiQuery({ name: 'name', required: false, type: String })
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

  // Update RBAC of the user which is shared with
  @Put(':familyTreeId/shared-users/:userId')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'familyTreeId', required: true, type: String })
  @ApiParam({ name: 'userId', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateSharedFamilyTreeById(
    @Req() req: AuthenticatedRequest,
    @Param() param: SharedFamilyTreeUpdateParamDto,
    @Body() body: SharedFamilyTreeUpdateRequestDto,
  ): Promise<void> {
    // check access (whether he can modify)
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        // TODO: in future we might have another option smth like canEditRBAC, so we need to check that one
        canEditMembers: true,
        canAddMembers: true,
        canDeleteMembers: true,
      },
    );

    return this.sharedFamilyTreeService.updateSharedFamilyTreeById(
      param.userId,
      param.familyTreeId,
      body,
    );
  }
}
