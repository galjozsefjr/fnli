import { plainToInstance } from 'class-transformer';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import 'dotenv/config';

export class Configuration {
  @IsOptional()
  @IsEnum(['development', 'test', 'production'])
  NODE_ENV = 'development';

  @IsOptional()
  API_HOST = '0.0.0.0';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  API_PORT = 3001;

  @IsString()
  DATABASE_HOST = '';

  @IsString()
  DATABASE_USERNAME = '';

  @IsString()
  DATABASE_PASSWORD = '';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  DATABASE_PORT = 5432;

  @IsOptional()
  DATABASE_NAME = 'fnli';

  public get DATABASE_URL() {
    return `postgresql://${this.DATABASE_USERNAME}:${this.DATABASE_PASSWORD}@${this.DATABASE_HOST}:${this.DATABASE_PORT}/${this.DATABASE_NAME}`;
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(Configuration, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
