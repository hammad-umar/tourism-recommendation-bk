import { parse, stringify } from 'flatted';
import { concat, filter, uniq } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, ILike } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

import { Place } from './place.entity';
import { CreatePlaceDto } from './dtos/create-place.dto';
import { UpdatePlaceDto } from './dtos/update-place.dto';
import { Picture } from '../common/entities/picture.entity';
import { Interest } from '../interests/interest.entity';
import { Category } from '../category/category.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { User } from '../users/user.entity';
import { Rating } from '../ratings/rating.entity';

type PlaceWithScore = {
  score: number;
} & Place;

type Demographics = {
  age: number;
  location: string;
  gender: string;
};

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
    private readonly entityManager: EntityManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async find(options: IPaginationOptions): Promise<Pagination<Place>> {
    return paginate<Place>(this.placesRepository, options, {
      relations: {
        ratings: true,
        interests: true,
        picture: true,
        category: true,
      },
    });
  }

  async findOne(id: string): Promise<Place> {
    const place = await this.placesRepository.findOne({
      where: { id },
      relations: {
        ratings: {
          user: true,
        },
        interests: true,
        picture: true,
        category: true,
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    return place;
  }

  async save(place: Place): Promise<Place> {
    return await this.placesRepository.save(place);
  }

  async create(createPlaceDto: CreatePlaceDto): Promise<Place> {
    const {
      name,
      country,
      location,
      description,
      category: categoryId,
      picture: pictureBase64,
      interests: interestsIdsArray,
    } = createPlaceDto;

    const uniqueInterestsIds = uniq(interestsIdsArray);

    const category = await this.entityManager.findOne(Category, {
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found!');
    }

    const { publicId, secureUrl } = await this.fileUploadService.upload(
      pictureBase64,
    );

    const pictureEntity = this.entityManager.create(Picture, {
      secureUrl,
      publicId,
    });

    const picture = await this.entityManager.save(pictureEntity);

    const placeEntity = this.placesRepository.create({
      category,
      country,
      name,
      description,
      location,
      picture,
    });

    for (let i = 0; i < uniqueInterestsIds.length; i++) {
      const interest = await this.entityManager.findOne(Interest, {
        where: { id: uniqueInterestsIds[i], places: true },
      });

      if (!interest) continue;

      if (!placeEntity.interests) {
        placeEntity.interests = concat([], interest);
      } else {
        placeEntity.interests = concat(placeEntity.interests, interest);
      }
    }

    return this.placesRepository.save(placeEntity);
  }

  async update(id: string, updatedPlaceDto: UpdatePlaceDto): Promise<Place> {
    const {
      name,
      picture,
      country,
      location,
      description,
      category: categoryId,
      interests: interestsIdsArray,
      removedInterests: removedInterestsIds,
    } = updatedPlaceDto;

    const updateOptions = Object.keys(updatedPlaceDto);
    const uniqueInterestsIds = uniq(interestsIdsArray);
    const uniqueRemovedInterestsIds = uniq(removedInterestsIds);
    const updatedPlaceObj: Partial<Place> = {};

    const place = await this.placesRepository.findOne({
      where: { id },
      relations: { picture: true, interests: true },
    });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    for (let i = 0; i < updateOptions.length; i++) {
      switch (updateOptions[i]) {
        case 'category':
          const category = await this.entityManager.findOne(Category, {
            where: { id: categoryId },
          });

          if (!category) {
            throw new NotFoundException('Category not found!');
          }

          updatedPlaceObj.category = category;
          break;

        case 'picture':
          if (place?.picture?.publicId) {
            await this.fileUploadService.remove(place.picture.publicId);

            const { publicId, secureUrl } = await this.fileUploadService.upload(
              picture,
            );

            const placePicture = await this.entityManager.findOne(Picture, {
              where: { publicId: place.picture.publicId },
            });

            placePicture.publicId = publicId;
            placePicture.secureUrl = secureUrl;

            await this.entityManager.save(placePicture);
          }
          break;

        case 'name':
          updatedPlaceObj.name = name;
          break;

        case 'country':
          updatedPlaceObj.country = country;
          break;

        case 'location':
          updatedPlaceObj.location = location;
          break;

        case 'description':
          updatedPlaceObj.description = description;
          break;

        case 'interests':
          if (uniqueInterestsIds.length) {
            place.interests = [];

            for (let i = 0; i < uniqueInterestsIds.length; i++) {
              const interest = await this.entityManager.findOne(Interest, {
                where: { id: uniqueInterestsIds[i], places: true },
              });

              if (!interest) continue;

              const interestAlreadyExist = place.interests.find(
                (interest) => interest.id === uniqueInterestsIds[i],
              );

              if (interestAlreadyExist) continue;

              place.interests = concat(place.interests || [], interest);

              await this.placesRepository.save(place);
            }
          }
          break;

        case 'removedInterests':
          if (uniqueRemovedInterestsIds.length) {
            for (let i = 0; i < uniqueRemovedInterestsIds.length; i++) {
              const interest = await this.entityManager.findOne(Interest, {
                where: { id: uniqueRemovedInterestsIds[i], places: true },
              });

              if (!interest) continue;

              const placeInterest = place.interests.find(
                (interest) => interest.id === uniqueRemovedInterestsIds[i],
              );

              if (!placeInterest) continue;

              place.interests = filter(place.interests, (interest) => {
                return interest.id !== uniqueRemovedInterestsIds[i];
              });

              await this.placesRepository.save(place);
            }
          }
          break;
      }
    }

    Object.assign(place, updatedPlaceObj);
    return parse(stringify(await this.placesRepository.save(place)));
  }

  async delete(id: string): Promise<Place> {
    const place = await this.placesRepository.findOne({ where: { id } });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    return this.placesRepository.remove(place);
  }

  async availablePlaces(options: IPaginationOptions, searchTerm: string) {
    return paginate<Place>(this.placesRepository, options, {
      where: [
        {
          name: ILike(`%${searchTerm}%`),
        },
        {
          description: ILike(`%${searchTerm}%`),
        },
      ],
      relations: {
        ratings: true,
        picture: true,
        category: true,
      },
    });
  }

  async destinationsPlaces(userId: string) {
    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });

    let destinationsPlaces: Place[] = [];
    const likedPlaces: Place[] = [];
    const visitedPlaces: Place[] = [];

    const userLikedPlacesLength =
      user?.likedPlaces?.length > 0 ? user.likedPlaces.length : 0;

    const userVisitedPlacesLength =
      user?.vistedPlaces?.length > 0 ? user.vistedPlaces.length : 0;

    for (let i = 0; i < userLikedPlacesLength; i++) {
      const place = await this.placesRepository.findOne({
        where: { id: user.likedPlaces[i] },
        relations: {
          picture: true,
          category: true,
          ratings: true,
          interests: true,
        },
      });

      likedPlaces.push(place);
    }

    for (let i = 0; i < userVisitedPlacesLength; i++) {
      const place = await this.placesRepository.findOne({
        where: { id: user.vistedPlaces[i] },
        relations: {
          picture: true,
          category: true,
          ratings: true,
          interests: true,
        },
      });

      visitedPlaces.push(place);
    }

    destinationsPlaces = [...likedPlaces, ...visitedPlaces];

    return destinationsPlaces;
  }

  private async _contentBasedRecommendations(
    userPrefrences: Interest[],
  ): Promise<PlaceWithScore[]> {
    let recommendationsPlaces: PlaceWithScore[] = [];

    const userPrefrencesNames = userPrefrences.map(
      (prefrence) => prefrence.title,
    );

    const allPlaces = await this.placesRepository.find({
      relations: {
        interests: true,
        ratings: true,
        category: true,
        picture: true,
      },
    });

    allPlaces.forEach((place) => {
      let score = 0;

      place.interests.forEach(({ title }) => {
        if (userPrefrencesNames.includes(title)) {
          score++;
        }
      });

      if (score > 0) {
        recommendationsPlaces.push({ ...place, score });
      }
    });

    recommendationsPlaces = uniq(recommendationsPlaces);
    recommendationsPlaces.sort((a, b) => b.score - a.score);

    return recommendationsPlaces;
  }

  private async _collaborativeBasedRecommendations(userId: string) {
    const allPlaces = await this.placesRepository.find({
      relations: {
        ratings: { user: { ratings: true } },
        interests: true,
        category: true,
        picture: true,
      },
    });

    const userRatings: Rating[] = [];

    allPlaces.forEach((place) => {
      place.ratings.forEach((rating) => {
        if (rating.user.id === userId) {
          userRatings.push(rating);
        }
      });
    });

    if (!userRatings) {
      return [];
    }

    const similarUsers: User[] = [];

    userRatings.forEach((rating) => {
      if (rating.user.id === userId) {
        similarUsers.push(rating.user);
      }
    });

    let recommendationsPlaces: Place[] = [];

    similarUsers.forEach(({ id }) => {
      allPlaces.forEach((place) => {
        place.ratings.forEach((rating) => {
          userRatings.forEach((userRating) => {
            if (rating.user.id === id && userRating.id !== id) {
              recommendationsPlaces.push(place);
            }
          });
        });
      });
    });

    recommendationsPlaces = uniq(recommendationsPlaces);
    return recommendationsPlaces;
  }

  private async _demographicBasedFilterings(user: User) {
    // add logic here for demographics filtering ...
  }

  async recommendationsPlaces(userId: string): Promise<PlaceWithScore[]> {
    let recommendationsPlaces: any[] = [];

    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: {
        ratings: true,
        interests: true,
      },
    });

    const contentBasedPlaces = await this._contentBasedRecommendations(
      user.interests,
    );

    const collaborativeBasedPlaces =
      await this._collaborativeBasedRecommendations(user.id);

    recommendationsPlaces = [contentBasedPlaces, collaborativeBasedPlaces];
    const [contentBasedRecs, collaborativeBasedRecs] = recommendationsPlaces;

    return [...contentBasedRecs, ...collaborativeBasedRecs];
  }

  async addDemographics(
    { location, gender, age }: any,
    placeId: string,
  ): Promise<Place> {
    const place = await this.placesRepository.findOne({
      where: {
        id: placeId,
      },
    });

    if (!place?.demographics) {
      place.demographics.location = location;
      place.demographics.gender = gender;
      place.demographics.age = age;
    }

    return this.placesRepository.save(place);
  }
}
