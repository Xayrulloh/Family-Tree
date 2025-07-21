import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from '~/common/guards/google-oauth.guard';
import { Response } from 'express';
import { COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import { AuthenticatedRequest } from '~/shared/types/request-with-user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {
    // This method intentionally left empty since the guard handles redirection
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new Error('No user found in request');
    }

    const token = await this.authService.signIn(user);

    res.cookie(COOKIES_ACCESS_TOKEN_KEY, token, {
      maxAge: 2592000000, // 30 days
      httpOnly: true,
      // sameSite: 'strict',
      sameSite: 'none',
      secure: true,
    });

    res.redirect('http://localhost:4200/family-trees');
  }
}
