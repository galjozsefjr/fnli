import type { UserEntity } from './user';
import type { PaginatedResults } from './common';

export const SimulationStatus = {
  CREATED: 'created',
  STARTED: 'started',
  STOP: 'stop',
  FINISHED: 'finished',
};
export type SimulationStatus = (typeof SimulationStatus)[keyof typeof SimulationStatus];

export type HitsEntity = {
  id: number;
  simulation?: SimulationEntity;
  draws: number[];
  hits: number[];
  matches: number;
  createdAt: Date;
};

export type HitStatistic = {
  matches: number;
  hitcount: number;
};

export type SimulationEntity = {
  id: string;
  owner?: UserEntity;
  status: SimulationStatus;
  totalDraws: number;
  ticketPrice: number;
  fixedNumbers: number[] | null;
  simulationInterval: number;
  hits?: HitsEntity[];
  createdAt: Date;
  updatedAt: Date;
};

export type SimulationDetails = Pick<SimulationEntity, 'id' | 'status' | 'totalDraws' | 'fixedNumbers'> & {
  totalSpent: number;
  matches: HitStatistic[];
};

export type CreateSimulationRequest = Pick<SimulationEntity, 'fixedNumbers' | 'simulationInterval'>;

export type ChangeSimulationSpeed = Pick<SimulationEntity, 'simulationInterval'>;

export type PaginatedSimulationList = PaginatedResults<SimulationEntity>;

export type PaginatedHitList = PaginatedResults<HitsEntity>;
