import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, type Repository } from 'typeorm';
import { Simulation } from './simulations.entity';
import { PaginatedSimulation, SimulationDetailsDto } from './simulations.type';
import { HitsService } from './hits.service';
import {
  SimulationStatus,
  type CreateSimulationRequest,
} from '@fnli/types/simulations';

@Injectable()
export class SimulationsService {
  constructor(
    @InjectRepository(Simulation) private simulations: Repository<Simulation>,
    @InjectDataSource() private dataSource: DataSource,
    private hits: HitsService,
  ) {}

  public async getSimulationsForUser(userId: string, offset = 0, limit = 20) {
    const [simulations, total] = await this.simulations.findAndCount({
      where: {
        owner: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });
    return new PaginatedSimulation(simulations, total, offset, limit);
  }

  public async getSimulationById(userId: string, simulationId: string) {
    const simulation = await this.getSimulation(userId, simulationId);
    const hitStatistic = await this.hits.getHitStatistics(simulationId);
    return new SimulationDetailsDto(simulation, hitStatistic);
  }

  protected async getSimulation(userId: string, simulationId: string) {
    const simulation = await this.simulations.findOne({
      where: {
        id: simulationId,
        owner: {
          id: userId,
        },
      },
      relations: {
        owner: true,
      },
    });
    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }
    return simulation;
  }

  public async registerSimulation(
    userId: string,
    simulationRequest: CreateSimulationRequest,
  ) {
    const result = await this.dataSource.transaction(async (entityManager) => {
      const simulation = entityManager.create(Simulation, {
        owner: { id: userId },
        status: SimulationStatus.CREATED,
        totalDraws: 0,
        ticketPrice: 300,
        simulationInterval: simulationRequest.simulationInterval,
        fixedNumbers: simulationRequest.fixedNumbers,
      });
      return await entityManager.save(Simulation, simulation);
    });
    return result;
  }

  public async updateSimulationInterval(
    userId: string,
    simulationId: string,
    interval: number,
  ) {
    // check if simulation exists & belongs to the user
    await this.getSimulation(userId, simulationId);
    const updateResult = await this.dataSource.transaction(
      async (entityManager) => {
        return await entityManager.update(Simulation, simulationId, {
          simulationInterval: interval,
        });
      },
    );
    if (!updateResult.affected) {
      throw new NotFoundException();
    }
    return this.getSimulationById(userId, simulationId);
  }
}
