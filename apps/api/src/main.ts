import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';
import { Configuration } from './app.configuration';
import { setupSwagger } from './swagger/setup-swagger';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
      logger: [
        'log',
        'warn',
        'error',
        'fatal',
        ...(process.env.NODE_ENV === 'production'
          ? []
          : ([
              'verbose',
              'debug',
            ] satisfies NestApplicationContextOptions['logger'])),
      ],
    },
  );
  const config: ConfigService<Configuration> = app.get(ConfigService);

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      enableDebugMessages: true,
    }),
  );
  app.enableShutdownHooks();

  process.on('uncaughtException', (error, source) => {
    logger.error({
      message: `Uncaught exception: ${error?.message}`,
      stack: error?.stack,
      source,
    });
  });

  setupSwagger(app, 'api');

  try {
    const apiPort = config.get<string>('API_PORT') ?? 3000;
    const apiHost = config.get<string>('API_HOST') ?? '0.0.0.0';
    await app.listen(apiPort, apiHost, () => {
      logger.debug(
        `Application started in ${process.env.NODE_ENV ?? 'dev'} environment`,
      );
      logger.debug(`Service layer is listening on ${apiHost}:${apiPort}`);
    });
  } catch (err) {
    logger.error(err);
  }
}

void (async () => {
  await bootstrap();
})();
