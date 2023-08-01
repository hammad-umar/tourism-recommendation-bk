import { User } from 'src/users/user.entity';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  iat: number;
  exp: number;
};
