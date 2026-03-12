import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import type { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';

import { validate } from './app.configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from 'src/database/datasource';
import { AuthModule } from 'src/auth/auth.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'FNLI',
        level: isProd ? 'info' : 'debug',
        serializers: {
          req: ({
            method,
            url,
            params,
          }: {
            method: string;
            url: string;
            params: Record<string, unknown>;
          }) => ({ method, url, params }),
          res: ({ statusCode }: { statusCode: number }) => ({ statusCode }),
          output: () => undefined,
        },
        transport: isProd ? undefined : { target: 'pino-pretty' },
        customLogLevel: (
          _req: IncomingMessage,
          res: ServerResponse<IncomingMessage>,
        ) => {
          if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn';
          } else if (res.statusCode >= 500) {
            return 'error';
          }
          return 'info';
        },
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions as TypeOrmModuleOptions),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
