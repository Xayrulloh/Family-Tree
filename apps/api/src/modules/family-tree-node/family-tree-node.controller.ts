import {
  FamilyTreeNodeGetAllResponseSchema,
  FamilyTreeNodeGetResponseSchema,
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
import {
  type FamilyTreeNodeBindRequestDto,
  type FamilyTreeNodeCreateRequestDto,
  type FamilyTreeNodeGetAllParamDto,
  FamilyTreeNodeGetAllResponseDto,
  type FamilyTreeNodeGetParamDto,
  FamilyTreeNodeGetResponseDto,
  type FamilyTreeNodeUpdateRequestDto,
} from './dto/family-tree-node.dto';
import { FamilyTreeNodeService } from './family-tree-node.service';

@ApiTags('Family Tree Node')
@ApiParam({ name: 'familyTreeId', required: true, type: String })
@Controller('family-trees/:familyTreeId/nodes')
export class FamilyTreeNodeController {
  constructor(private readonly familyTreeNodeService: FamilyTreeNodeService) {}

  // mock user create (node)
  @Post()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeNodeGetResponseDto })
  @ZodSerializerDto(FamilyTreeNodeGetResponseSchema)
  async createFamilyTreeNode(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeNodeCreateRequestDto,
    @Param() param: FamilyTreeNodeGetAllParamDto,
  ): Promise<FamilyTreeNodeGetResponseDto> {
    return this.familyTreeNodeService.createFamilyTreeNode(
      req.user.id,
      param.familyTreeId,
      body,
    );
  }

  // real user bind
  @Post('/bind')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiCreatedResponse({ type: FamilyTreeNodeGetResponseDto })
  @ZodSerializerDto(FamilyTreeNodeGetResponseSchema)
  async bindFamilyTreeNode(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeNodeBindRequestDto,
    @Param() param: FamilyTreeNodeGetAllParamDto,
  ): Promise<FamilyTreeNodeGetResponseDto> {
    return this.familyTreeNodeService.bindFamilyTreeNode(
      req.user.id,
      param.familyTreeId,
      body,
    );
  }

  // edit mock user
  @Put(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async updateFamilyTreeNode(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeNodeUpdateRequestDto,
    @Param() param: FamilyTreeNodeGetParamDto,
  ): Promise<void> {
    return this.familyTreeNodeService.updateFamilyTreeNode(
      req.user.id,
      param,
      body,
    );
  }

  // delete mock user
  @Delete(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async deleteFamilyTreeNode(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeNodeGetParamDto,
  ): Promise<void> {
    return this.familyTreeNodeService.deleteFamilyTreeNode(req.user.id, param);
  }

  // response
  // get all nodes of tree
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeNodeGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeNodeGetAllResponseSchema)
  async getAllFamilyTreeNodes(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeNodeGetAllParamDto,
  ): Promise<FamilyTreeNodeGetAllResponseDto> {
    return this.familyTreeNodeService.getAllFamilyTreeNodes(
      req.user.id,
      param.familyTreeId,
    );
  }

  // get node by id and tree
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeNodeGetResponseDto })
  @ZodSerializerDto(FamilyTreeNodeGetResponseSchema)
  async getFamilyTreeNode(
    @Req() require: AuthenticatedRequest,
    @Param() param: FamilyTreeNodeGetParamDto,
  ): Promise<FamilyTreeNodeGetResponseDto> {
    return this.familyTreeNodeService.getFamilyTreeNode(require.user.id, param);
  }
}
