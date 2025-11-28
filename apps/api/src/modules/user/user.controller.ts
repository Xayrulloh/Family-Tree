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
  ApiBody,
  ApiCookieAuth,
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
  type UserIdParamDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from './dto/user.dto';
// biome-ignore lint/style/useImportType: <throws an error if put type>
import { UserService } from './user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

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
    const cachedUser = await this.cacheService.get<UserResponseDto>(
      `users:${req.user.id}`,
    );

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userService.getUserThemselves(req.user.id);

    this.cacheService.set(`users:${req.user.id}`, user);

    return user;
  }

  // Find exactly one user by its id
  @Get(':id')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @ApiParam({ name: 'id', required: true, type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResponseDto })
  @ZodSerializerDto(UserResponseSchema)
  async getUserById(@Param() param: UserIdParamDto): Promise<UserResponseDto> {
    const cachedUser = await this.cacheService.get<UserResponseDto>(
      `users:${param.id}`,
    );

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userService.getUserById(param.id);

    this.cacheService.set(`users:${param.id}`, user);

    return user;
  }

  // Update user themselves info
  @Put()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: UserUpdateRequestDto })
  @ApiNoContentResponse()
  async updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() body: UserUpdateRequestDto,
  ): Promise<void> {
    await this.userService.updateUser(req.user.id, body);

    await this.cacheService.del(`users:${req.user.id}`);
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
    const user = await this.userService.updateUserAvatar(req.user.id);

    await this.cacheService.del(`users:${req.user.id}`);
    this.cacheService.set(`users:${req.user.id}`, user);

    return user;
  }
}
