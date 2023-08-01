import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../database/abstract.entity';

@Entity()
export class Picture extends AbstractEntity<Picture> {
  @Column()
  secureUrl: string;

  @Column()
  publicId: string;
}
