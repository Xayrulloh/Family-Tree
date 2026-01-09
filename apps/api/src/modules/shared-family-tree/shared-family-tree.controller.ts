import {
  SharedFamilyTreeArrayResponseSchema,
  SharedFamilyTreeUsersArrayResponseSchema,
} from '@family-tree/shared';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
// biome-ignore lint/style/useImportType: <query/param doesn't work>
import {
  SharedFamilyTreeArrayResponseDto,
  SharedFamilyTreeIdParamDto,
  SharedFamilyTreeUsersArrayResponseDto,
} from './dto/shared-family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from './shared-family-tree.service';

@ApiTags('Shared Family Tree')
@Controller('family-trees')
export class SharedFamilyTreeController {
  constructor(
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
  ) {}

  // Find shared family trees of user
  @Get('shared')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SharedFamilyTreeArrayResponseDto })
  @ZodSerializerDto(SharedFamilyTreeArrayResponseSchema)
  async getSharedFamilyTreesOfUser(
    @Req() req: AuthenticatedRequest,
  ): Promise<SharedFamilyTreeArrayResponseDto> {
    return this.sharedFamilyTreeService.getSharedFamilyTreesOfUser(req.user.id);
  }

  // Find the users which is shared with
  @Get(':id/shared-users')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SharedFamilyTreeUsersArrayResponseDto })
  @ZodSerializerDto(SharedFamilyTreeUsersArrayResponseSchema)
  async getSharedFamilyTreeUsersById(
    @Req() req: AuthenticatedRequest,
    @Param() param: SharedFamilyTreeIdParamDto,
  ): Promise<SharedFamilyTreeUsersArrayResponseDto> {
    return this.sharedFamilyTreeService.getSharedFamilyTreeUsersById(
      req.user.id,
      param.id,
    );
  }
}
