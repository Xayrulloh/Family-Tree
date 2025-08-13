import {
  Inject,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import cookiesConfig from './cookies.config';

@Module({
  imports: [ConfigModule.forFeature(cookiesConfig)],
})
export class CookiesModule implements NestModule {
  constructor(
    @Inject(cookiesConfig.KEY)
    private readonly config: ConfigType<typeof cookiesConfig>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(this.config.secret)).forRoutes('*any');
  }
}
