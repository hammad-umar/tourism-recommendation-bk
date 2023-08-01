import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from '../common/database/abstract.entity';
import { Place } from '../places/place.entity';

@Entity()
export class Category extends AbstractEntity<Category> {
  @Column({ unique: true })
  title: string;

  @OneToMany(() => Place, (place) => place.category)
  @JoinColumn()
  places: Place[];
}
