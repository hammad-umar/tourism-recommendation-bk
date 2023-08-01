import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, NextFunction } from 'express';
import { get, omit } from 'lodash';
import { UsersService } from '../../users/users.service';
import { JwtPayloadType } from '../types/jwt-payload.type';
import { ITourismRecommenderRequest } from '../types/tourism-recommender-request.interface';

@Injectable()
export class DeserializeUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: ITourismRecommenderRequest, __: Response, next: NextFunction) {
    const token = get(req, 'headers.authorization', '').replace(
      /^Bearer\s/,
      '',
    );

    if (!token) return next();

    const decoded = this.jwtService.verify<JwtPayloadType>(token);

    if (decoded) {
      const user = await this.usersService.findOne({
        where: { id: decoded.id },
        relations: { picture: true },
      });

      req.currentUser = omit(user, 'password');

      return next();
    }

    return next();
  }
}
