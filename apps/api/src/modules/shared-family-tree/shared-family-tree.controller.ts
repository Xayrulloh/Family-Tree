import { SharedFamilyTreeArrayResponseSchema } from '@family-tree/shared';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { ZodSerializerDto } from 'nestjs-zod';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import { SharedFamilyTreeArrayResponseDto } from './dto/shared-family-tree.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { SharedFamilyTreeService } from './shared-family-tree.service';

@ApiTags('Shared Family Tree')
@Controller('shared-family-trees')
export class SharedFamilyTreeController {
  constructor(
    private readonly sharedFamilyTreeService: SharedFamilyTreeService,
  ) {}

  // Find shared family trees of user
  @Get()
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
}
