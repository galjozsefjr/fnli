import type { PaginatedResults, PaginationParams } from '@fnli/types/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export const DEFAULT_PAGINATION_LIMIT = 20;

export class PaginationParameters implements PaginationParams {
  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Number of elements that should be skipped',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiProperty({
    type: 'number',
    required: false,
    description: 'Number of elements expected in the list',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = DEFAULT_PAGINATION_LIMIT;
}

export abstract class PaginatedResult<T> implements PaginatedResults<T> {
  data: T[];

  @ApiProperty({
    type: 'number',
    description: 'Number of total elements',
  })
  total: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of requested elements',
  })
  limit: number;

  @ApiProperty({
    type: 'number',
    description:
      'Number of skipped elements, expected to be divisible by limit',
  })
  offset: number;

  @ApiProperty({
    type: 'boolean',
    description: 'True if this is the first section',
  })
  isFirst: boolean;

  @ApiProperty({
    type: 'boolean',
    description: 'True if this is the last section (no more entities)',
  })
  isLast: boolean;

  constructor(data: T[], total: number, offset: number, limit: number) {
    this.data = data;
    this.total = total;
    this.offset = offset;
    this.limit = limit;
    this.isFirst = offset === 0;
    this.isLast = offset + limit >= total || data.length < limit;
  }
}
