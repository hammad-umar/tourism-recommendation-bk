import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../common/database/abstract.entity';
import { User } from '../users/user.entity';
import { Place } from '../places/place.entity';

@Entity()
export class Interest extends AbstractEntity<Interest> {
  @Column({ unique: true })
  title: string;

  @ManyToOne(() => User, (user) => user.interests)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Place, (place) => place.interests)
  places: Place[];
}
