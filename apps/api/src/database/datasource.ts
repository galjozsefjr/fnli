import { DataSource, type DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import type { Configuration } from 'src/app.configuration';
import { join } from 'path';

config();

const configService = new ConfigService<Configuration>();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),

  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [join(`${__dirname}/../**/*.entity.{js,ts}`)],
  migrations: [join(`${__dirname}/migrations/**/*.ts`)],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),

  logging: configService.get('NODE_ENV') === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
