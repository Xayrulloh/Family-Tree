import { UserResponseSchema } from '@family-tree/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
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
  type UserIdParamDto,
  UserResponseDto,
  type UserUpdateRequestDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Find user themselves
  @Get('me')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ZodSerializerDto(UserResponseSchema)
  async getUserThemselves(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    return this.userService.getUserThemselves(req.user.id);
  }

  // Find exactly one user by its email (instead of mock user, users may connect real users)
  // @Get(':email')
  // @UseGuards(JWTAuthGuard)
  // @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  // @ApiParam({ name: 'email', required: true, type: String })
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: UserResponseDto })
  // @ZodSerializerDto(UserResponseSchema)
  // async getUserByEmail(
  //   @Param() param: UserEmailParamDto
  // ): Promise<UserResponseDto> {
  //   return this.userService.getUserByEmail(param.email);
  // } // FIXME: need to think about this

  // Find exactly one user by its id
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ZodSerializerDto(UserResponseSchema)
  async getUserById(@Param() param: UserIdParamDto): Promise<UserResponseDto> {
    return this.userService.getUserById(param.id);
  }

  // Update user themselves info
  @Put()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() body: UserUpdateRequestDto,
  ): Promise<void> {
    return this.userService.updateUser(req.user.id, body);
  }

  // Random image for user
  @Patch('/avatar')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ZodSerializerDto(UserResponseSchema)
  async updateUserAvatar(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    return this.userService.updateUserAvatar(req.user.id);
  }
}
