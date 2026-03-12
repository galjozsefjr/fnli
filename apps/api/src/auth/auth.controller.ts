import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ChangePasswordBody,
  LoginRequest,
  LoginResponse,
  RegisterUserRequestBody,
  RegisterUserResponse,
  UpdateUserDataBody,
} from '../users/user.type';
import { UsersService } from '../users/users.service';
import { AuthToken, type UserAuthToken } from './auth-token.decorator';
import { User } from '@fnli/types/user'

type AuthRequest = FastifyRequest & { user: User };

@ApiTags('Users')
@Controller('/api/user')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) { }

  @ApiOperation({
    summary: 'Get user data',
    description: 'Returns the user information of an authenticated user',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid auth token',
  })
  @ApiOkResponse({
    type: RegisterUserResponse,
    description: 'User profile',
  })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Get()
  public async getProfile(@AuthToken() { userId }: UserAuthToken) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    const { password: _password, ...data } = user;
    return data;
  }

  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update user data, excluding email and password'
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid auth token' })
  @ApiOkResponse({ type: RegisterUserResponse, description: 'Updated user data' })
  @ApiBearerAuth('bearer')
  @UseGuards(JwtAuthGuard)
  @Put()
  public async updateProfile(
    @AuthToken() { userId }: UserAuthToken,
    @Body() updateUserData: UpdateUserDataBody
  ) {
    const { password, ...data } = await this.users.updateUserData(userId, updateUserData);
    return data;
  }

  @ApiOperation({ summary: 'Login', description: 'Logs in an existing user' })
  @ApiCreatedResponse({ type: LoginResponse, description: 'JWT Bearer token - valid till 2 hours' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({
    type: LoginRequest,
  })
  public async login(@Request() req: AuthRequest): Promise<LoginResponse> {
    const accessToken = await this.auth.login(req.user);
    return {
      accessToken,
    };
  }

  @ApiOperation({ summary: 'Registration', description: 'Add new user' })
  @ApiConflictResponse({ description: 'User already regisered' })
  @ApiCreatedResponse({ type: RegisterUserResponse })
  @Post()
  @ApiBody({ type: RegisterUserRequestBody })
  public async register(@Body() userData: RegisterUserRequestBody): Promise<User> {
    const { password, ...user } = await this.users.register(userData);
    return user;
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update password', description: 'Change the users password' })
  @ApiForbiddenResponse({ description: 'Old password is not accepted' })
  @ApiNotFoundResponse({ description: 'Cannot find user' })
  @ApiConflictResponse({ description: 'Old and new passwords cannot be the same' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Patch('/login')
  async changePassword(
    @AuthToken() { userId }: UserAuthToken,
    @Body() changePassword: ChangePasswordBody
  ) {
    await this.users.changePassword(userId, changePassword);
  }
}
