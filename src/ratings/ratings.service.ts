import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { User } from '../users/user.entity';
import { Place } from '../places/place.entity';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingsRepository: Repository<Rating>,
    private readonly entityManager: EntityManager,
  ) {}

  async find(options: IPaginationOptions, placeId: string) {
    return paginate<Rating>(this.ratingsRepository, options, {
      where: {
        place: { id: placeId },
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Rating> {
    const rating = await this.ratingsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found!');
    }

    return rating;
  }

  async delete(id: string, userId: string): Promise<Rating> {
    const rating = await this.ratingsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found!');
    }

    return this.ratingsRepository.remove(rating);
  }

  async create(
    placeId: string,
    userId: string,
    { comment, rating }: CreateRatingDto,
  ): Promise<Rating> {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { ratings: true },
    });

    const place = await this.entityManager.findOne(Place, {
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    const ratingObj: Partial<Rating> = {
      user,
      rating,
      comment,
      place,
    };

    const newRatingEntity = this.ratingsRepository.create(ratingObj);
    const newRating = await this.ratingsRepository.save(newRatingEntity);

    return newRating;
  }
}
