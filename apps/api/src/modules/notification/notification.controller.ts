import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResponseDto } from './dto/notification.dto';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger/dist/decorators';
import { JWTAuthGuard } from '../../common/guards/jwt-auth.guard';
import { COOKIES_ACCESS_TOKEN_KEY } from '../../utils/constants';
import { Request } from 'express';
import { NotificationResponseSchema } from '@family-tree/shared';
import { ZodSerializerDto } from 'nestjs-zod';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly NotificationService: NotificationService) {}

  // Find user Notifications
  @Get()
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NotificationResponseDto })
  @ZodSerializerDto(NotificationResponseSchema)
  async getUserNotifications(
    @Req() req: Request
  ): Promise<NotificationResponseDto> {
    return this.NotificationService.getUserNotifications(req.user!.id);
  }

  // Mark all notifications as read
  @Get('/read')
  @UseGuards(JWTAuthGuard)
  @ApiCookieAuth(COOKIES_ACCESS_TOKEN_KEY)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: Request): Promise<void> {
    return this.NotificationService.markAllAsRead(req.user!.id);
  }
}
