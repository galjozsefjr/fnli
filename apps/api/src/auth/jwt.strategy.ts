import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Configuration } from '../app.configuration';
import { UserAuthToken } from './auth-token.decorator';

type Payload = {
  sub: UserAuthToken['userId'];
  username: UserAuthToken['username'];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Configuration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_TOKEN_SECRET') as string,
    });
  }

  validate(payload: Payload): UserAuthToken {
    return { userId: payload.sub, username: payload.username };
  }
}
