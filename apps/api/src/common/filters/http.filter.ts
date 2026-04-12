import {
  type ArgumentsHost,
  Catch,
  HttpException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import type { ZodError } from 'zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  override catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      // nestjs-zod v5 types getZodError() as unknown; safe to cast because
      // ZodSerializationException always wraps a ZodError instance
      this.logger.error(
        `ZodSerializationException: ${(zodError as ZodError).message}`,
      );
    }

    super.catch(exception, host);
  }
}
