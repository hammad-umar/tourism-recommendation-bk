import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from '../common/database/abstract.entity';
import { Category } from '../category/category.entity';
import { Picture } from '../common/entities/picture.entity';
import { Rating } from '../ratings/rating.entity';
import { Interest } from '../interests/interest.entity';

@Entity()
export class Place extends AbstractEntity<Place> {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  country: string;

  @Column({ type: 'simple-json', nullable: true })
  location?: {
    latitude: number;
    longitude: number;
  };

  @Column({ type: 'simple-json', nullable: true })
  demographics?: {
    age: number;
    location: string;
    gender: string;
  };

  @Column({ default: 0, type: 'float' })
  averageRating: number;

  @Column({ default: 0 })
  numOfRatings: number;

  @OneToMany(() => Rating, (rating) => rating.place)
  @JoinColumn()
  ratings: Rating[];

  @ManyToOne(() => Category, (category) => category.places)
  @JoinColumn()
  category: Category;

  @OneToOne(() => Picture, { nullable: true })
  @JoinColumn()
  picture?: Picture;

  @ManyToMany(() => Interest, (interest) => interest.places)
  @JoinTable()
  interests: Interest[];
}
