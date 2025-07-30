import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserResponseDto,
  UserUpdateRequestDto,
  UserIdParamDto,
} from './dto/user.dto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { JWTAuthGuard } from '~/common/guards/jwt-auth.guard';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import { UserResponseSchema } from '@family-tree/shared';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthenticatedRequest } from '~/shared/types/request-with-user';

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
    @Req() req: AuthenticatedRequest
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
  updateUser(
    @Req() req: AuthenticatedRequest,
    @Body() body: UserUpdateRequestDto
  ): Promise<void> {
    return this.userService.updateUser(req.user.id, body);
  }
}
