import { Column, Entity, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../common/database/abstract.entity';
import { Picture } from '../common/entities/picture.entity';
import { Role } from '../common/enums/role.enum';
import { Rating } from '../ratings/rating.entity';
import { Interest } from '../interests/interest.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ default: Role.TOURIST })
  role: string;

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

  @OneToOne(() => Picture, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  picture?: Picture;

  @OneToMany(() => Rating, (rating) => rating.user)
  @JoinColumn()
  ratings: Rating[];

  @OneToMany(() => Interest, (interest) => interest.user)
  @JoinColumn()
  interests: Interest[];

  @Column({ type: 'simple-array', nullable: true })
  likedPlaces: string[];

  @Column({ type: 'simple-array', nullable: true })
  vistedPlaces: string[];

  @Column({ type: 'simple-array', nullable: true })
  savedPlaces: string[];

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'bigint', nullable: true })
  resetPasswordExpire: number;
}
