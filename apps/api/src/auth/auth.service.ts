import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@fnli/types/user';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async validateUser(
    username: string,
    pass: string,
  ): Promise<User | null> {
    const user = await this.usersService.findOne(username);
    if (user && (await compare(pass, user.password))) {
      const { password: _password, ...userData } = user;
      return userData;
    }
    return null;
  }

  public login(user: User): Promise<string> {
    return this.jwtService.signAsync({
      username: user.email,
      sub: user.id,
    });
  }
}
