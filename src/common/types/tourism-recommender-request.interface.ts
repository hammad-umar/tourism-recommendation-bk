import { Request } from 'express';
import { User } from '../../users/user.entity';

export interface ITourismRecommenderRequest extends Request {
  currentUser?: Omit<User, 'password'> | null;
}
