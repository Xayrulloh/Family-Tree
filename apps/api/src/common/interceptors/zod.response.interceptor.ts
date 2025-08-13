import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { validate, type ZodDto, ZodSerializationException } from 'nestjs-zod';
import { map, type Observable } from 'rxjs';
import type { ZodError, ZodSchema } from 'zod';

const ZodSerializerDtoOptions = 'ZOD_SERIALIZER_DTO_OPTIONS' as const;

const createZodSerializationException = (error: ZodError) => {
  return new ZodSerializationException(error);
};

@Injectable()
export class ZodSerializerInterceptorCustom implements NestInterceptor {
  constructor(@Inject(Reflector) protected readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const responseSchema = this.getContextResponseSchema(context);

    return next.handle().pipe(
      map((res: object | object[]) => {
        if (!responseSchema) {
          return res;
        }

        if (typeof res !== 'object' || res instanceof StreamableFile) {
          return res;
        }

        return validate(res, responseSchema, createZodSerializationException);
      }),
    );
  }

  protected getContextResponseSchema(
    context: ExecutionContext,
  ): ZodDto | ZodSchema | undefined {
    return this.reflector.getAllAndOverride(ZodSerializerDtoOptions, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
