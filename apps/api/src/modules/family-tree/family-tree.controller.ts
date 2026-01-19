import {
  FamilyTreeArrayResponseSchema,
  FamilyTreeResponseSchema,
} from '@family-tree/shared';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeArrayResponseDto,
  FamilyTreeCreateRequestDto,
  FamilyTreeIdParamDto,
  FamilyTreeResponseDto,
  FamilyTreeUpdateRequestDto,
} from './dto/family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeService } from './family-tree.service';

@ApiTags('Family Tree')
@Controller('family-trees')
export class FamilyTreeController {
  constructor(
    private readonly familyTreeService: FamilyTreeService,
    private readonly familyTreeMemberService: FamilyTreeMemberService,
    private readonly cacheService: CacheService,
  ) {}

  // Find family trees of user
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeArrayResponseDto })
  @ZodSerializerDto(FamilyTreeArrayResponseSchema)
  async getFamilyTreesOfUser(
    @Req() req: AuthenticatedRequest,
  ): Promise<FamilyTreeArrayResponseDto> {
    const cachedUserFamilyTrees =
      await this.cacheService.get<FamilyTreeArrayResponseDto>(
        `users:${req.user.id}:family-trees`,
      );

    if (cachedUserFamilyTrees) {
      return cachedUserFamilyTrees;
    }

    const trees = await this.familyTreeService.getFamilyTreesOfUser(
      req.user.id,
    );

    this.cacheService.set(`users:${req.user.id}:family-trees`, trees);

    return trees;
  }

  // Find family tree by id
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeResponseDto })
  @ZodSerializerDto(FamilyTreeResponseSchema)
  async getFamilyTreeById(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreeResponseDto> {
    const cachedFamilyTree = await this.cacheService.get<FamilyTreeResponseDto>(
      `family-trees:${param.id}`,
    );

    if (cachedFamilyTree) {
      return cachedFamilyTree;
    }

    const familyTree = await this.familyTreeService.getFamilyTreeById(param.id);

    if (req.user.id !== familyTree.createdBy) {
      throw new ForbiddenException(
        'You are not allowed to access this family tree',
      );
    }

    this.cacheService.set(`family-trees:${param.id}`, familyTree);

    return familyTree;
  }

  // Create family tree for user
  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeCreateRequestDto })
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

    await this.cacheService.del(`users:${req.user.id}:family-trees`);

    return familyTree;
  }

  // Update family tree by id
  @Put(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeUpdateRequestDto })
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeIdParamDto,
    @Body() body: FamilyTreeUpdateRequestDto,
  ): Promise<void> {
    await this.cacheService.delMultiple([
      `family-trees:${param.id}`,
      `family-trees:${param.id}:members`,
      `family-trees:${param.id}:members:connections`,
      `users:${req.user.id}:family-trees`,
    ]);

    return this.familyTreeService.updateFamilyTree(req.user.id, param.id, body);
  }

  // Delete family tree by id
  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async deleteFamilyTree(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<void> {
    await this.cacheService.delMultiple([
      `family-trees:${param.id}`,
      `family-trees:${param.id}:members`,
      `family-trees:${param.id}:members:connections`,
      `users:${req.user.id}:family-trees`,
    ]);

    return this.familyTreeService.deleteFamilyTree(req.user.id, param.id);
  }
}
