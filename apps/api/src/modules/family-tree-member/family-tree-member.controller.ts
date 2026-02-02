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
  UseInterceptors,
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
import { FamilyTreeCacheInterceptor } from '~/common/interceptors/family-tree.cache.interceptor';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from '../shared-family-tree/shared-family-tree.service';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  FamilyTreeMemberCreateChildRequestDto,
  FamilyTreeMemberCreateParentsRequestDto,
  FamilyTreeMemberCreateSpouseRequestDto,
  FamilyTreeMemberGetAllParamDto,
  FamilyTreeMemberGetAllResponseDto,
  FamilyTreeMemberGetParamDto,
  FamilyTreeMemberGetResponseDto,
  FamilyTreeMemberUpdateRequestDto,
} from './dto/family-tree-member.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from './family-tree-member.service';

@ApiTags('Family Tree Member')
@ApiParam({ name: 'familyTreeId', required: true, type: String })
@Controller('family-trees/:familyTreeId/members')
@UseInterceptors(FamilyTreeCacheInterceptor)
export class FamilyTreeMemberController {
  constructor(
    private readonly familyTreeMemberService: FamilyTreeMemberService,
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
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
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        canAddMembers: true,
      },
    );

    return this.familyTreeMemberService.createFamilyTreeMemberChild(
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
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        canAddMembers: true,
      },
    );

    return this.familyTreeMemberService.createFamilyTreeMemberSpouse(
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
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        canAddMembers: true,
      },
    );

    return this.familyTreeMemberService.createFamilyTreeMemberParents(
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
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        canEditMembers: true,
      },
    );

    return this.familyTreeMemberService.updateFamilyTreeMember(param, body);
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
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
      {
        canDeleteMembers: true,
      },
    );

    return this.familyTreeMemberService.deleteFamilyTreeMember(param);
  }

  // get all nodes of tree
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberGetAllResponseSchema)
  async getAllFamilyTreeMembers(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberGetAllParamDto,
  ): Promise<FamilyTreeMemberGetAllResponseDto> {
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
    );

    return this.familyTreeMemberService.getAllFamilyTreeMembers(param);
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
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberGetParamDto,
  ): Promise<FamilyTreeMemberGetResponseDto> {
    // check access
    await this.sharedFamilyTreeService.checkAccessSharedFamilyTree(
      req.user.id,
      param.familyTreeId,
    );

    return this.familyTreeMemberService.getFamilyTreeMember(param);
  }
}
