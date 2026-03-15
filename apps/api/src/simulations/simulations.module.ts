import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

import { UsersModule } from 'src/users/users.module';
import { Hits } from './hits.entity';
import { HitsService } from './hits.service';
import { Simulation } from './simulations.entity';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Simulation, Hits]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SimulationsController],
  providers: [SimulationsService, HitsService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
