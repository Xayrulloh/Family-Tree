import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { COOKIE_DOMAIN } from '~/utils/constants';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const returnUrl = request.query.return_url as string | undefined;

    if (returnUrl) {
      response.cookie('auth_redirect_url', returnUrl, {
        maxAge: 2592000000, // 30 days
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        domain: COOKIE_DOMAIN,
      });
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
