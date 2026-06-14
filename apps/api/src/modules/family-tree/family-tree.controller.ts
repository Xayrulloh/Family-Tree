import {
  FamilyTreePaginationResponseSchema,
  FamilyTreePreviewResponseSchema,
  FamilyTreeResponseSchema,
} from '@family-tree/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import { OwnerGuard } from '~/common/guards/owner.guard';
import { PublicGuard } from '~/common/guards/public.guard';
import { FamilyTreeCacheInterceptor } from '~/common/interceptors/family-tree.cache.interceptor';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeCreateRequestDto,
  FamilyTreeIdParamDto,
  FamilyTreePaginationAndSearchQueryDto,
  FamilyTreePaginationResponseDto,
  FamilyTreePreviewResponseDto,
  FamilyTreeResponseDto,
  FamilyTreeUpdateRequestDto,
} from './dto/family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeService } from './family-tree.service';

@ApiTags('Family Tree')
@Controller('family-trees')
@UseInterceptors(FamilyTreeCacheInterceptor)
export class FamilyTreeController {
  constructor(
    private readonly familyTreeService: FamilyTreeService,
    private readonly familyTreeMemberService: FamilyTreeMemberService,
  ) {}

  // Find family trees of user
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreePaginationResponseDto })
  @ZodSerializerDto(FamilyTreePaginationResponseSchema)
  async getFamilyTreesOfUser(
    @Req() req: AuthenticatedRequest,
    @Query() query: FamilyTreePaginationAndSearchQueryDto,
  ): Promise<FamilyTreePaginationResponseDto> {
    // for public trees userId not needed
    if (query.isPublic) {
      return this.familyTreeService.getPublicFamilyTrees(query);
    }

    return this.familyTreeService.getFamilyTreesOfUser(req.user.id, query);
  }

  // Public preview metadata for share-link crawlers (Telegram, OG, etc.)
  @Get(':id/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreePreviewResponseDto })
  @ZodSerializerDto(FamilyTreePreviewResponseSchema)
  async getFamilyTreePreview(
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreePreviewResponseDto> {
    return this.familyTreeService.getFamilyTreeById(param.id);
  }

  // Find public family tree by id (read-only, no auth — for anon visitors)
  @Get(':id/public')
  @UseGuards(PublicGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async getPublicFamilyTreeById(
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreeResponseDto> {
    return this.familyTreeService.getFamilyTreeById(param.id);
  }

  // Find family tree by id (owner only)
  @Get(':id')
  @UseGuards(JWTAuthGuard, OwnerGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async getFamilyTreeById(
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreeResponseDto> {
    return this.familyTreeService.getFamilyTreeById(param.id);
  }

  // Create family tree for user
  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async createFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeCreateRequestDto,
  ): Promise<FamilyTreeResponseDto> {
    const familyTree = await this.familyTreeService.createFamilyTree(
      req.user.id,
      body,
    );

    // initial members
    await this.familyTreeMemberService.createFamilyTreeMemberInitial(
      req.user,
      familyTree.id,
    );

    return familyTree;
  }

  // Update family tree by id (owner only)
  @Put(':id')
  @UseGuards(JWTAuthGuard, OwnerGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateFamilyTree(
    @Param() param: FamilyTreeIdParamDto,
    @Body() body: FamilyTreeUpdateRequestDto,
  ): Promise<void> {
    return this.familyTreeService.updateFamilyTree(param.id, body);
  }

  // Delete family tree by id (owner only)
  @Delete(':id')
  @UseGuards(JWTAuthGuard, OwnerGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async deleteFamilyTree(@Param() param: FamilyTreeIdParamDto): Promise<void> {
    return this.familyTreeService.deleteFamilyTree(param.id);
  }
}
