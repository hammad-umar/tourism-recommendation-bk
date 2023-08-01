import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../common/database/abstract.entity';
import { Place } from '../places/place.entity';
import { User } from '../users/user.entity';

@Entity()
export class Rating extends AbstractEntity<Rating> {
  @Column()
  rating: number;

  @Column()
  comment: string;

  @ManyToOne(() => Place, (place) => place.ratings)
  @JoinColumn()
  place: Place;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn()
  user: User;
}
