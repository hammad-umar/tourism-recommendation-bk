import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { Rating } from './rating.entity';
import { Place } from '../places/place.entity';
import { User } from '../users/user.entity';

@EventSubscriber()
export class RatingSubscriber implements EntitySubscriberInterface<Rating> {
  listenTo(): typeof Rating {
    return Rating;
  }

  async afterInsert(event: InsertEvent<Rating>): Promise<void> {
    const ratingsCount = await event.manager.count(Rating);

    const place = await event.manager.findOne(Place, {
      where: { id: event.entity.place.id },
      relations: { ratings: true },
    });

    const user = await event.manager.findOne(User, {
      where: { id: event.entity.user.id },
      relations: { ratings: true },
    });

    const averageRatings =
      place.ratings.reduce((acc, currVal) => currVal.rating + acc, 0) /
      ratingsCount;

    place.numOfRatings = ratingsCount;
    place.averageRating = averageRatings;

    place.ratings.push(event.entity);
    user.ratings.push(event.entity);

    await event.manager.save(place);
    await event.manager.save(user);
  }
}
