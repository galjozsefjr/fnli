import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

import { UsersModule } from 'src/users/users.module';
import { Hits } from './hits.entity';
import { HitsService } from './hits.service';
import { LotteryService } from './lottery.service';
import { Simulation } from './simulations.entity';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Simulation, Hits]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CacheModule.register(),
  ],
  controllers: [SimulationsController],
  providers: [SimulationsService, HitsService, LotteryService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
