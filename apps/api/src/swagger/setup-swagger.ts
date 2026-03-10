import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: NestFastifyApplication, path = '/'): void => {
  const config = new DocumentBuilder()
    .setTitle('Lottery Simulator API')
    .addBearerAuth({
      type: 'http',
      in: 'header',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const api = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, api);
};
