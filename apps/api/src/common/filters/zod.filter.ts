import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import type { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = 400;

    const zodError = exception.getZodError();

    // nestjs-zod v5 types getZodError() as unknown; safe to cast because
    // ZodValidationException always wraps a ZodError instance
    const errors = (zodError as ZodError).issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors,
    });
  }
}
