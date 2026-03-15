import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HitsEntity } from '@fnli/types/simulations';
import { Simulation } from './simulations.entity';

@Entity()
@Check('"matches" BETWEEN 2 AND 5')
@Check('array_length("hits", 1) = 5')
@Check('array_length("draws", 1) = 5')
export class Hits implements HitsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Simulation, { cascade: ['remove'] })
  @JoinColumn()
  simulation: Simulation;

  @Column('smallint', { array: true })
  draws: number[];

  @Column('smallint', { array: true })
  hits: number[];

  @Column('smallint')
  @Index()
  matches: number;

  @CreateDateColumn()
  createdAt: Date;
}
