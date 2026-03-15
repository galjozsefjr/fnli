import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from 'src/utils/pagination';
import { Hits } from './hits.entity';
import { HitStatistic } from '@fnli/types/simulations';

export class PaginatedHits extends PaginatedResult<Hits> {
  @ApiProperty({
    type: [Hits],
    isArray: true,
    description: 'Details of tickets that has some actual matches',
  })
  declare data: Hits[];
}

export type RawHitStatistic = {
  matches: string;
  hitcount: string;
};

export class HitStatisticDto implements HitStatistic {
  @ApiProperty({
    type: 'number',
    description:
      'Number of items that actually matches in the draw and played numbers - can be between 2 & 5',
  })
  matches: number;

  @ApiProperty({
    type: 'number',
    description: 'Number of actual hits for the current match',
  })
  hitcount: number;

  constructor(stat: RawHitStatistic) {
    this.matches = parseInt(stat.matches);
    this.hitcount = parseInt(stat.hitcount);
  }
}
