import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthToken, type UserAuthToken } from 'src/auth/auth-token.decorator';

import { SimulationsService } from './simulations.service';
import {
  ChangeSimulationSpeedDto,
  CreateSimulationRequestDto,
  PaginatedSimulation,
  SimulationDetailsDto,
  SimulationDto,
  SimulationId,
} from './simulations.type';
import { PaginationParameters } from 'src/utils/pagination';

@Controller('/api/simulations')
export class SimulationsController {
  constructor(private simulations: SimulationsService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get simulations started by the user',
    description:
      'Returns the simulations that initiated by the current user - requires auth token',
  })
  @ApiOkResponse({ type: PaginatedSimulation })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid offset or limit value' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  public getSimulations(
    @AuthToken() token: UserAuthToken,
    @Query() { offset, limit }: PaginationParameters,
  ) {
    return this.simulations.getSimulationsForUser(token.userId, offset, limit);
  }

  @Post('/')
  @ApiBody({ type: CreateSimulationRequestDto })
  @ApiCreatedResponse({ type: SimulationDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid selected numbers' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  public registerSimulation(
    @AuthToken() token: UserAuthToken,
    @Body() simulation: CreateSimulationRequestDto,
  ) {
    return this.simulations.registerSimulation(token.userId, simulation);
  }

  @Get('/:simulationId')
  @ApiOperation({
    summary: 'Get simulation details',
    description: 'Returns the detailed information of one specific simulation',
  })
  @ApiOkResponse({ type: SimulationDetailsDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Simulation does not exists' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  public getSimulation(
    @AuthToken() token: UserAuthToken,
    @Param() { simulationId }: SimulationId,
  ) {
    return this.simulations.getSimulationById(token.userId, simulationId);
  }

  @Patch('/:simulationId')
  @ApiOperation({
    summary: 'Change the simulation speed',
    description: 'Update the ',
  })
  @ApiBody({ type: ChangeSimulationSpeedDto })
  @ApiOkResponse({ type: SimulationDetailsDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Simulation does not exists' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  public updateSimulationInterval(
    @AuthToken() token: UserAuthToken,
    @Param() { simulationId }: SimulationId,
    @Body() { simulationInterval }: ChangeSimulationSpeedDto,
  ) {
    return this.simulations.updateSimulationInterval(
      token.userId,
      simulationId,
      simulationInterval,
    );
  }
}
