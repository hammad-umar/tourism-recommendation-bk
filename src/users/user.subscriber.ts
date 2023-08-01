import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';
import { hashPassword } from '../common/utils/bcrypt.utils';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): typeof User {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    const user = event.entity;
    user.password = await hashPassword(user.password);
  }
}
