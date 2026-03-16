import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Hits } from './hits.entity';
import {
  SimulationStatus,
  type SimulationEntity,
} from '@fnli/types/simulations';

@Entity()
@Check('"fixed_numbers" IS NULL OR array_length("fixed_numbers", 1) = 5')
export class Simulation implements SimulationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { cascade: ['remove'] })
  @JoinColumn()
  owner: User;

  @Column({
    type: 'enum',
    enum: SimulationStatus,
    default: SimulationStatus.CREATED,
  })
  status: SimulationStatus;

  @Column('smallint', { default: 0 })
  totalDraws: number;

  @Column('integer', { default: 300 })
  ticketPrice: number;

  @Column('smallint', { array: true, nullable: true })
  fixedNumbers: number[] | null;

  @OneToMany(() => Hits, () => Simulation)
  hits?: Hits[];

  @Column('smallint')
  simulationInterval: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
