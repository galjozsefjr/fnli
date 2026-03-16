import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, type Repository } from 'typeorm';
import { Simulation } from './simulations.entity';
import { PaginatedSimulation, SimulationDetailsDto } from './simulations.type';
import { Hits } from './hits.entity';
import { HitsService } from './hits.service';
import { LotteryService } from './lottery.service';
import {
  SimulationEntity,
  SimulationStatus,
  type CreateSimulationRequest,
} from '@fnli/types/simulations';
import dayjs from 'dayjs';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SimulationsService {
  private log = new Logger(SimulationsService.name);

  constructor(
    @InjectRepository(Simulation) private simulations: Repository<Simulation>,
    @InjectDataSource() private dataSource: DataSource,
    private hits: HitsService,
    private lottery: LotteryService,
    private schedulerRegistry: SchedulerRegistry,
  ) { }

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
    this.runSimulation(result.id).catch((error) => {
      this.log.error(error);
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

  public async runSimulation(simulationId: string) {
    const simulation = await this.simulations.findOneBy({ id: simulationId });
    if (!simulation || simulation.status === SimulationStatus.FINISHED) {
      this.log.error(
        simulation
          ? `Simulation "${simulationId}" already finished`
          : `Simulation "${simulationId}" not exist`,
      );
      return null;
    }

    if (this.isExpired(simulation)) {
      this.log.warn(`Simulation "${simulationId}" expired`);
      await this.dataSource.transaction(async (manager) => {
        await manager.update(Simulation, simulationId, {
          status: SimulationStatus.FINISHED,
        });
      });
      return null;
    }

    await this.dataSource.transaction(async (manager) => {
      const winningNumbers = this.lottery.createRandomLotteryNumbers();
      const currentNumbers =
        simulation.fixedNumbers ?? this.lottery.createRandomLotteryNumbers();
      const matchingItems = this.lottery.countMatches(
        winningNumbers,
        currentNumbers,
      );
      const status: SimulationStatus =
        matchingItems === 5
          ? SimulationStatus.FINISHED
          : SimulationStatus.STARTED;

      await manager.update(Simulation, simulationId, {
        status,
        totalDraws: () => `total_draws + 1`,
      });
      if (matchingItems > 1) {
        const hit = manager.create(Hits, {
          simulation: { id: simulationId },
          draws: winningNumbers,
          hits: currentNumbers,
          matches: matchingItems,
        });
        await manager.save(hit);
      }
    });
    this.scheduleNext(simulationId, simulation.simulationInterval);
  }

  protected scheduleNext(simulationId: string, interval: number) {
    const name = `${simulationId}:scheduler`;
    const existing = this.schedulerRegistry.getTimeout(name);
    if (existing) {
      this.schedulerRegistry.deleteTimeout(name);
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => {
      this.log.info(`Start next job for "${simulationId}" in ${interval} ms`);
      this.runSimulation(simulationId).catch((error) => this.log.error(error));
    }, interval);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  protected isExpired(simulation: SimulationEntity) {
    const createdAt = dayjs(simulation.createdAt);
    const currentLotteryDay = createdAt
      .clone()
      .add(simulation.totalDraws, 'week');
    const endYear = createdAt.clone().add(500, 'years');
    return endYear.unix() <= currentLotteryDay.unix();
  }
}
