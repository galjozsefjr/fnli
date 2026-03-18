import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class SimulationsService {
  private log = new Logger(SimulationsService.name);

  static UNCHANGE_TIMEOUT = 15;
  static EXPIRE_YEARS = 500;

  constructor(
    @InjectRepository(Simulation) private simulations: Repository<Simulation>,
    @InjectDataSource() private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private hits: HitsService,
    private lottery: LotteryService,
    private schedulerRegistry: SchedulerRegistry,
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

  public async getSimulationDetails(simulationId: string) {
    const [simulation, hitStatistic] = await Promise.all([
      this.getSimulationById(simulationId),
      this.hits.getHitStatistics(simulationId),
    ]);
    return new SimulationDetailsDto(simulation, hitStatistic);
  }

  protected async getSimulationById(simulationId: string) {
    const simulation = await this.simulations.findOne({
      where: { id: simulationId },
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
    const simulation = await this.getSimulationById(simulationId);
    if (simulation.status === 'finished') {
      throw new ConflictException(
        'Cannot change the speed of a finished simulation',
      );
    }
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
    return this.getSimulationDetails(simulationId);
  }

  public async runSimulation(simulationId: string) {
    this.log.debug('Running simulation %s', simulationId);
    const simulation = await this.getSimulationById(simulationId);
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
      this.log.debug('[simulation %s] start update', simulationId);

      const winningNumbers = this.lottery.createRandomLotteryNumbers();
      const currentNumbers =
        simulation.fixedNumbers ?? this.lottery.createRandomLotteryNumbers();
      const matchingItems = this.lottery.countMatches(
        winningNumbers,
        currentNumbers,
      );

      this.log.debug(
        '[simulation %s] numbers created: bet - [%s] win - [%s] - %d matches',
        simulationId,
        currentNumbers.join(','),
        winningNumbers.join(','),
        matchingItems,
      );

      const status: SimulationStatus =
        matchingItems === 5
          ? SimulationStatus.FINISHED
          : SimulationStatus.STARTED;

      this.log.debug('[simulation %s] new status: %s', simulationId, status);

      const updates = await manager.update(Simulation, simulationId, {
        status,
        totalDraws: () => `total_draws + 1`,
        lastDraw: winningNumbers,
        lastPlay: currentNumbers,
      });

      this.log.debug(
        '[simulation %s] simulation updated %o',
        simulationId,
        updates,
      );

      if (matchingItems > 1) {
        const hit = manager.create(Hits, {
          simulation: { id: simulationId },
          draws: winningNumbers,
          hits: currentNumbers,
          matches: matchingItems,
        });
        await manager.save(hit);

        this.log.debug('[simulation %s] save match: %d', simulationId, hit.id);
      }
    });
    await this.cacheManager.set(
      `simulation:${simulationId}`,
      await this.getSimulationDetails(simulationId),
      simulation.simulationInterval * 10,
    );
    this.log.debug('[simulation %s] schedule next job', simulationId);
    this.scheduleNext(simulationId, simulation.simulationInterval);
  }

  protected scheduleNext(simulationId: string, interval: number) {
    const name = `${simulationId}:scheduler`;
    const exists = this.schedulerRegistry.doesExist('timeout', name);
    if (exists) {
      this.log.debug(
        '[scheduleSimulation %s] stop & remove existing job - %d',
        simulationId,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const existing = this.schedulerRegistry.getTimeout(name);
      this.schedulerRegistry.deleteTimeout(name);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      clearTimeout(existing);
    }
    this.log.debug(
      '[scheduleSimulation %s] created scheduled job %s - start in %d ms',
      simulationId,
      name,
      interval,
    );
    const timeout = setTimeout(() => {
      this.log.log(`Start next job for "${simulationId}" in ${interval} ms`);
      this.runSimulation(simulationId).catch((error) => this.log.error(error));
    }, interval);
    this.schedulerRegistry.addTimeout(name, timeout);
    this.log.debug('[scheduleSimulation %s] job registered', simulationId);
  }

  protected isExpired(simulation: SimulationEntity) {
    const createdAt = dayjs(simulation.createdAt);
    const currentLotteryDay = createdAt
      .clone()
      .add(simulation.totalDraws, 'week');
    const endYear = createdAt
      .clone()
      .add(SimulationsService.EXPIRE_YEARS, 'years');
    return endYear.unix() <= currentLotteryDay.unix();
  }

  async getCachedSimulationDetails(userId: string, simulationId: string) {
    const cache = await this.cacheManager.get<SimulationDetailsDto>(
      `simulation:${simulationId}`,
    );
    if (cache) {
      if (!cache.hasOwner(userId)) {
        throw new ForbiddenException('Access denied');
      }
      return cache;
    }
    const simulation = await this.getSimulationDetails(simulationId);
    if (!simulation.hasOwner(userId)) {
      throw new NotFoundException('Cannot find simulation');
    }
    return simulation;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupDeadProcesses() {
    try {
      const updatedLines = await this.dataSource.transaction(
        async (manager) => {
          return await manager
            .createQueryBuilder()
            .update(Simulation)
            .set({ status: 'stop' })
            .where({ status: 'started' })
            .andWhere("updated_at < NOW() - (:seconds * INTERVAL '1 second')", {
              seconds: SimulationsService.UNCHANGE_TIMEOUT,
            })
            .execute();
        },
      );
      this.log.log(
        'Mark %d simulations as stoped - no updates since %d seconds',
        updatedLines.affected ?? 0,
        SimulationsService.UNCHANGE_TIMEOUT,
      );
    } catch (error) {
      this.log.error(error);
    }
  }
}
