import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';
import { Hits } from './hits.entity';
import {
  HitStatisticDto,
  PaginatedHits,
  RawHitStatistic,
} from 'src/simulations/hits.type';

@Injectable()
export class HitsService {
  constructor(@InjectRepository(Hits) private hits: Repository<Hits>) {}

  public async getHits(simulationId: string, offset = 0, limit = 20) {
    const [hits, total] = await this.hits.findAndCount({
      where: {
        simulation: {
          id: simulationId,
        },
      },
      skip: offset,
      take: limit,
    });
    return new PaginatedHits(hits, total, offset, limit);
  }

  public async getHitStatistics(
    simulationId: string,
  ): Promise<HitStatisticDto[]> {
    const queryBuilder = this.hits.createQueryBuilder('hits');
    queryBuilder
      .innerJoin('hits.simulation', 'simulation')
      .select('COUNT(DISTINCT hits.id)', 'hitcount')
      .addSelect('hits.matches', 'matches')
      .where('simulation.id = :simulationId', { simulationId })
      .groupBy('hits.matches');
    const results = await queryBuilder.getRawMany<RawHitStatistic>();
    return results.map((item) => new HitStatisticDto(item));
  }

  public async getLastHit(simulationId: string) {
    return this.hits.findOne({
      where: {
        simulation: {
          id: simulationId,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }
}
