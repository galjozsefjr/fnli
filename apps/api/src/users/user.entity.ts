import type { UserEntity } from '@fnli/types/user';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User implements UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 160 })
  email: string;

  @Column('varchar', { length: 120 })
  firstName: string;

  @Column('varchar', { length: 120 })
  lastName: string;

  @Column('varchar', { length: 64 })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
