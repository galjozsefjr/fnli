import {
  ApiExtraModels,
  ApiProperty,
  getSchemaPath,
  PickType,
} from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { type Simulation } from './simulations.entity';
import { PaginatedResult } from 'src/utils/pagination';
import {
  type ChangeSimulationSpeed,
  type CreateSimulationRequest,
  type HitStatistic,
  type SimulationDetails,
  type SimulationEntity,
  SimulationStatus,
} from '@fnli/types/simulations';
import { HitStatisticDto } from 'src/simulations/hits.type';
import { Type } from 'class-transformer';
import { LotteryNumbers } from 'src/decorators/lotteryNumbers.decorator';

export class SimulationId {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Simulation ID' })
  @IsUUID()
  simulationId: string;
}

export class SimulationDto implements Omit<SimulationEntity, 'owner' | 'hits'> {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Simulation ID',
  })
  id: string;

  @ApiProperty({
    enum: SimulationStatus,
    enumName: 'SimulationStatus',
    description: 'Current status of the simulation',
  })
  status: SimulationStatus;

  @ApiProperty({
    type: 'number',
    description: 'Number of total plays within the current simulation',
  })
  totalDraws: number;

  @ApiProperty({
    type: 'number',
    description: 'Price of the actual ticket in the current simulation',
  })
  ticketPrice: number;

  @ApiProperty({
    type: 'number',
    isArray: true,
    required: false,
    nullable: true,
    example: [12, 24, 36, 48, 60],
    description:
      'The numbers user played originally - null if set to random values in each run',
  })
  fixedNumbers: number[] | null;

  @ApiProperty({
    type: 'number',
    description: 'Simulation speed',
    example: 500,
  })
  simulationInterval: number;

  @ApiProperty({
    type: [Number],
    description: 'Last draws',
    example: [12, 45, 63, 72, 89],
    nullable: true,
    required: false,
  })
  lastDraw: number[] | null;

  @ApiProperty({
    type: [Number],
    description: 'Last played numbers',
    example: [13, 45, 63, 72, 90],
    nullable: true,
    required: false,
  })
  lastPlay: number[] | null;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Simulation created time',
  })
  createdAt: Date;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
    description: 'Simulation last updated time',
  })
  updatedAt: Date;
}

@ApiExtraModels(SimulationDto)
export class PaginatedSimulation extends PaginatedResult<Simulation> {
  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(SimulationDto) },
    description: 'Simulations started by user',
  })
  declare data: Simulation[];
}

export class SimulationDetailsDto
  extends PickType(SimulationDto, [
    'id',
    'status',
    'totalDraws',
    'fixedNumbers',
    'simulationInterval',
    'lastDraw',
    'lastPlay',
  ] as const)
  implements SimulationDetails
{
  @ApiProperty({
    type: 'number',
    description: 'The number of money the user spent till the actual point',
  })
  totalSpent: number;

  @ApiProperty({
    type: [HitStatisticDto],
    description: 'List of actual matches and number of actual hits',
  })
  matches: HitStatistic[];

  constructor(
    {
      id,
      status,
      totalDraws,
      fixedNumbers,
      ticketPrice,
      simulationInterval,
      lastDraw,
      lastPlay,
    }: SimulationEntity,
    hitStatistic: HitStatistic[],
  ) {
    super();
    this.id = id;
    this.status = status;
    this.totalDraws = totalDraws;
    this.fixedNumbers = fixedNumbers;
    this.totalSpent = totalDraws * ticketPrice;
    this.simulationInterval = simulationInterval;
    this.lastDraw = lastDraw;
    this.lastPlay = lastPlay;
    const matches = hitStatistic.reduce(
      (matchList, stat) => {
        matchList.set(stat.matches, stat.hitcount);
        return matchList;
      },
      new Map<number, number>([
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ]),
    );
    this.matches = Array.from(matches.entries())
      .map(([key, value]) => ({ matches: key, hitcount: value }))
      .toSorted(
        ({ matches: matchesA }, { matches: matchesB }) => matchesA - matchesB,
      );
  }
}

export class CreateSimulationRequestDto implements CreateSimulationRequest {
  @ApiProperty({
    type: 'number',
    isArray: true,
    required: false,
    nullable: true,
    description:
      'The numbers user played originally - null if set to random values in each run',
    example: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(90, { each: true })
  @LotteryNumbers()
  fixedNumbers: number[] | null;

  @ApiProperty({
    type: 'number',
    description: 'Simulation speed',
    example: 500,
  })
  @IsInt()
  @Min(10)
  @Max(1000)
  simulationInterval: number;
}

export class ChangeSimulationSpeedDto implements ChangeSimulationSpeed {
  @ApiProperty({
    type: 'number',
    description: 'Simulation speed',
    example: 500,
  })
  @IsInt()
  @Min(10)
  @Max(1000)
  simulationInterval: number;
}
