import {
  FamilyTreeMemberGetAllResponseSchema,
  FamilyTreeMemberGetResponseSchema,
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
import {
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
  type FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  type FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberUpdateRequestDto,
} from './dto/family-tree-member.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from './family-tree-member.service';

@ApiTags('Family Tree Member')
@ApiParam({ name: 'familyTreeId', required: true, type: String })
@Controller('family-trees/:familyTreeId/members')
export class FamilyTreeMemberController {
  constructor(
    private readonly FamilyTreeMemberService: FamilyTreeMemberService,
    private readonly cacheService: CacheService,
  ) {}

  // add member create (child)
  @Post('child')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ApiBody({ type: FamilyTreeMemberCreateChildRequestDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberChild(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeMemberCreateChildRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    await this.cacheService.delMultiple([
      `family-trees:${param.familyTreeId}:members`,
      `family-trees:${param.familyTreeId}:members:connections`,
    ]);

    return this.FamilyTreeMemberService.createFamilyTreeMemberChild(
      req.user.id,
      param.familyTreeId,
      body,
    );
  }

  // add member create (spouse)
  @Post('spouse')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ApiBody({ type: FamilyTreeMemberCreateSpouseRequestDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberSpouse(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeMemberCreateSpouseRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    await this.cacheService.delMultiple([
      `family-trees:${param.familyTreeId}:members`,
      `family-trees:${param.familyTreeId}:members:connections`,
    ]);

    return this.FamilyTreeMemberService.createFamilyTreeMemberSpouse(
      req.user.id,
      param.familyTreeId,
      body,
    );
  }

  // add member create (parents)
  @Post('parents')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberGetResponseDto })
  @ApiBody({ type: FamilyTreeMemberCreateParentsRequestDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async createFamilyTreeMemberParents(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeMemberCreateParentsRequestDto,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    await this.cacheService.delMultiple([
      `family-trees:${param.familyTreeId}:members`,
      `family-trees:${param.familyTreeId}:members:connections`,
    ]);

    return this.FamilyTreeMemberService.createFamilyTreeMemberParents(
      req.user.id,
      param.familyTreeId,
      body,
    );
  }

  // edit member user
  @Put(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: FamilyTreeMemberUpdateRequestDto })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async updateFamilyTreeMember(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberGetParamDto,
    @Body() body: FamilyTreeMemberUpdateRequestDto,
  ): Promise<void> {
    await this.cacheService.delMultiple([
      `family-trees:${param.familyTreeId}:members`,
      `family-trees:${param.familyTreeId}:members:connections`,
    ]);

    return this.FamilyTreeMemberService.updateFamilyTreeMember(
      req.user.id,
      param,
      body,
    );
  }

  // delete member user
  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async deleteFamilyTreeMember(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberGetParamDto,
  ): Promise<void> {
    await this.cacheService.delMultiple([
      `family-trees:${param.familyTreeId}:members`,
      `family-trees:${param.familyTreeId}:members:connections`,
    ]);

    return this.FamilyTreeMemberService.deleteFamilyTreeMember(
      req.user.id,
      param,
    );
  }

  // get all nodes of tree
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetAllResponseSchema)
  async getAllFamilyTreeMembers(
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    const cachedFamilyTreeMembers =
      await this.cacheService.get<FamilyTreeMemberGetAllResponseDto>(
        `family-trees:${param.familyTreeId}:members`,
      );

    if (cachedFamilyTreeMembers) {
      return cachedFamilyTreeMembers;
    }

    const familyTreeMembers =
      await this.FamilyTreeMemberService.getAllFamilyTreeMembers(param);

    this.cacheService.set(
      `family-trees:${param.familyTreeId}:members`,
      familyTreeMembers,
    );

    return familyTreeMembers;
  }

  // get node by id and tree
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberGetResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetResponseSchema)
  async getFamilyTreeMember(
    @Param() param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    const cachedFamilyTreeMember =
      await this.cacheService.get<FamilyTreeMemberGetResponseDto>(
        `family-trees:${param.familyTreeId}:members:${param.id}`,
      );

    if (cachedFamilyTreeMember) {
      return cachedFamilyTreeMember;
    }

    const familyTreeMember =
      await this.FamilyTreeMemberService.getFamilyTreeMember(param);

    this.cacheService.set(
      `family-trees:${param.familyTreeId}:members:${param.id}`,
      familyTreeMember,
    );

    return familyTreeMember;
  }
}
