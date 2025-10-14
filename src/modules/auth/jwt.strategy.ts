import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {AuthService} from "./auth.service";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService, 
  ) {
    const secret = configService.get<string>('SECRETKEY');

    if (!secret) {
      throw new Error('Key do JWT não encontrada. Verifique o arquivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

    async validate(payload: JwtPayload): Promise<any> {
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}

export interface JwtPayload { email: string; }