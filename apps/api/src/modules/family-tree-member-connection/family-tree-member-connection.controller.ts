import { FamilyTreeMemberConnectionGetAllResponseSchema } from '@family-tree/shared';
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
import {
  FamilyTreeMemberConnectionCreateRequestDto,
  type FamilyTreeMemberConnectionGetAllParamDto,
  FamilyTreeMemberConnectionGetAllResponseDto,
  type FamilyTreeMemberConnectionGetByMemberParamDto,
  type FamilyTreeMemberConnectionGetParamDto,
  FamilyTreeMemberConnectionUpdateRequestDto,
} from './dto/family-tree-member-connection.dto';
// biome-ignore lint/style/useImportType: <no need>
import { FamilyTreeMemberConnectionService } from './family-tree-member-connection.service';

@ApiTags('Family Tree Member Connection')
@ApiParam({ name: 'familyTreeId', required: true, type: String })
@Controller('family-trees/:familyTreeId/members')
export class FamilyTreeMemberConnectionController {
  constructor(
    private readonly familyTreeMemberConnectionService: FamilyTreeMemberConnectionService,
  ) {}

  // connect two users
  @Post('connections')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeMemberConnectionCreateRequestDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async createFamilyTreeMemberConnection(
    @Req() req: AuthenticatedRequest,
    @Body() body: FamilyTreeMemberConnectionCreateRequestDto,
    @Param() param: FamilyTreeMemberConnectionGetAllParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.createFamilyTreeMemberConnection(
      req.user.id,
      param,
      body,
    );
  }

  // edit connection
  @Put('connections/:id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiBody({ type: FamilyTreeMemberConnectionUpdateRequestDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async updateFamilyTreeMemberConnection(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberConnectionGetParamDto,
    @Body() body: FamilyTreeMemberConnectionUpdateRequestDto,
  ): Promise<void> {
    return this.familyTreeMemberConnectionService.updateFamilyTreeMemberConnection(
      req.user.id,
      param,
      body,
    );
  }

  // delete connection
  @Delete('connections/:id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiNoContentResponse()
  async deleteFamilyTreeMemberConnection(
    @Req() req: AuthenticatedRequest,
    @Param() param: FamilyTreeMemberConnectionGetParamDto,
  ): Promise<void> {
    return this.familyTreeMemberConnectionService.deleteFamilyTreeMemberConnection(
      req.user.id,
      param,
    );
  }

  // get all connections of tree
  @Get('connections')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
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
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'memberUserId', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: FamilyTreeMemberConnectionGetAllResponseDto })
  @ZodSerializerDto(FamilyTreeMemberConnectionGetAllResponseSchema)
  async getFamilyTreeMemberConnection(
    @Param() param: FamilyTreeMemberConnectionGetByMemberParamDto,
  ): Promise<FamilyTreeMemberConnectionGetAllResponseDto> {
    return this.familyTreeMemberConnectionService.getFamilyTreeMemberConnection(
      param,
    );
  }
}
