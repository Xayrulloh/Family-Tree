import {
  FamilyTreeArrayResponseSchema,
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
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { FamilyTreeMemberService } from '../family-tree-member/family-tree-member.service';
import {
  FamilyTreeArrayResponseDto,
  FamilyTreeCreateRequestDto,
  type FamilyTreeIdParamDto,
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
    return this.familyTreeService.getFamilyTreesOfUser(req.user.id);
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
    @Param() param: FamilyTreeIdParamDto,
  ): Promise<FamilyTreeResponseDto> {
    return this.familyTreeService.getFamilyTreeById(param.id);
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
    return this.familyTreeService.deleteFamilyTree(req.user.id, param.id);
  }
}
