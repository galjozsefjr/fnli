import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import {
  ChangePasswordBody,
  RegisterUserRequestBody,
  UpdateUserDataBody,
} from './user.type';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { DataSource, Repository } from 'typeorm';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  public findOne(email: string): Promise<User | null> {
    return this.users.findOneBy({ email });
  }

  public findById(userId: string): Promise<User | null> {
    return this.users.findOneBy({ id: userId });
  }

  public createPasswordHash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS);
  }

  protected async isExists(email: string) {
    return (await this.users.countBy({ email })) > 0;
  }

  public async register(userData: RegisterUserRequestBody) {
    if (await this.isExists(userData.username)) {
      throw new ConflictException('Already exists');
    }
    return this.dataSource.transaction(async (entityManager) => {
      const user = entityManager.create(User, {
        ...userData,
        email: userData.username,
        password: await this.createPasswordHash(userData.password),
      });
      return await entityManager.save(User, user);
    });
  }

  public async changePassword(
    userId: string,
    passwordData: ChangePasswordBody,
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    const validPass = await compare(passwordData.oldPassword, user.password);
    if (!validPass) {
      throw new ForbiddenException('Invalid password');
    }
    const samePasswordUsed = await compare(
      passwordData.password,
      user.password,
    );
    if (samePasswordUsed) {
      throw new ConflictException(
        'The new and old password cannot be the same',
      );
    }
    await this.dataSource.transaction(async (entityManager) => {
      const password = await this.createPasswordHash(passwordData.password);
      return entityManager.update(User, { id: user.id }, { password });
    });
    return this.findById(userId);
  }

  public async updateUserData(
    userId: string,
    userData: UpdateUserDataBody,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    await this.dataSource.transaction(async (entityManager) => {
      const { firstName, lastName } = userData;
      return entityManager.update(
        User,
        { id: userId },
        {
          firstName,
          lastName,
        },
      );
    });
    return this.findById(userId) as Promise<User>;
  }
}
