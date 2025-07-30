import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleOauthGuard } from '~/common/guards/google-oauth.guard';
import type { AuthenticatedRequest } from '~/shared/types/request-with-user';
import { CLIENT_URL, COOKIES_ACCESS_TOKEN_KEY } from '~/utils/constants';
import type { AuthService } from './auth.service';

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
    @Res() res: Response,
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

    res.redirect(`${CLIENT_URL}/family-trees`);
  }

  @Get('logout')
  async logout(@Req() _req: Request, @Res() res: Response): Promise<void> {
    res.clearCookie(COOKIES_ACCESS_TOKEN_KEY, {
      httpOnly: true,
      // sameSite: 'strict',
      sameSite: 'none',
      secure: true,
      path: '/',
    });

    res.status(200).send();
  }
}
