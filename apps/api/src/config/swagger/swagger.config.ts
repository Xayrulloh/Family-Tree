import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { patchNestJsSwagger } from 'nestjs-zod';

// biome-ignore lint/complexity/noStaticOnlyClass: no reason
class SwaggerBuilder {
  static make(app: INestApplication): void {
    app.use(
      '/docs',
      basicAuth({
        challenge: true,
        users: {
          admin: 'password',
        },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('Family-Tree API Docs')
      .setDescription(
        'Here you can see all the endpoints with request/response examples',
      )
      .addBearerAuth()
      .addApiKey({ in: 'header', name: 'api-key', type: 'apiKey' }, 'api-key')
      .build();

    patchNestJsSwagger();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        docExpansion: 'none',
        persistAuthorization: true,
      },
    });
  }
}

export default SwaggerBuilder;
