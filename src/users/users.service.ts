import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, EntityManager, Equal } from 'typeorm';
import { filter, find, omit } from 'lodash';
import { User } from './user.entity';
import { CreateUserDto } from '../common/dtos/create-user.dto';
import { UpdateUserDto } from '../common/dtos/update-user.dto';
import { FileUploadService } from '../common/services/file-upload.service';
import { Picture } from '../common/entities/picture.entity';
import { Place } from '../places/place.entity';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async find(options: IPaginationOptions): Promise<Pagination<User>> {
    return paginate<User>(this.usersRepository, options, {
      role: Equal('TOURIST'),
      relations: {
        picture: true,
      },
    });
  }

  async findOne(query: FindOneOptions<User>): Promise<User | null> {
    return this.usersRepository.findOne(query);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne({
      where: { id },
      relations: {
        picture: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (updateUserDto?.picture) {
      if (user?.picture?.publicId) {
        await this.fileUploadService.remove(user.picture.publicId);

        const { publicId, secureUrl } = await this.fileUploadService.upload(
          updateUserDto.picture,
        );

        const picture = await this.entityManager.findOne(Picture, {
          where: {
            publicId: user.picture.publicId,
          },
        });

        picture.publicId = publicId;
        picture.secureUrl = secureUrl;

        await this.entityManager.save(picture);
      } else {
        const { publicId, secureUrl } = await this.fileUploadService.upload(
          updateUserDto.picture,
        );

        const picture = this.entityManager.create(Picture, {
          publicId,
          secureUrl,
        });

        user.picture = picture;
        await this.entityManager.save(picture);
      }
    }

    Object.assign(user, omit(updateUserDto, 'picture'));
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<User> {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    return this.usersRepository.remove(user);
  }

  async toggleLikePlace(placeId: string, userId: string) {
    const place = await this.entityManager.findOne(Place, {
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    const user = await this.findOne({
      where: { id: userId },
    });

    if (!user?.likedPlaces) user.likedPlaces = [];

    const isPlaceAlreadyLiked = find(
      user.likedPlaces,
      (place) => place === placeId,
    );

    if (isPlaceAlreadyLiked) {
      user.likedPlaces = filter(user.likedPlaces, (place) => place !== placeId);
      return await this.usersRepository.save(user);
    } else {
      user.likedPlaces.push(placeId);
      return await this.usersRepository.save(user);
    }
  }

  async getUserHistory(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    const likedPlaces = [];
    const visitedPlaces = [];

    const userLikedPlacesLength =
      user?.likedPlaces?.length > 0 ? user.likedPlaces.length : 0;

    const userVisitedPlacesLength =
      user?.vistedPlaces?.length > 0 ? user.vistedPlaces.length : 0;

    for (let i = 0; i < userLikedPlacesLength; i++) {
      const place = await this.entityManager.findOne(Place, {
        where: { id: user.likedPlaces[i] },
        relations: {
          picture: true,
          category: true,
          ratings: true,
        },
      });

      likedPlaces.push(place);
    }

    for (let i = 0; i < userVisitedPlacesLength; i++) {
      const place = await this.entityManager.findOne(Place, {
        where: { id: user.vistedPlaces[i] },
        relations: {
          picture: true,
          category: true,
          ratings: true,
        },
      });

      visitedPlaces.push(place);
    }

    return { likedPlaces, visitedPlaces };
  }

  async toggleVisitPlace(placeId: string, userId: string) {
    const place = await this.entityManager.findOne(Place, {
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found!');
    }

    const user = await this.findOne({
      where: { id: userId },
    });

    if (!user?.vistedPlaces) user.vistedPlaces = [];

    const isPlaceAlreadyVisisted = find(
      user.vistedPlaces,
      (place) => place === placeId,
    );

    if (isPlaceAlreadyVisisted) {
      user.vistedPlaces = filter(
        user.vistedPlaces,
        (place) => place !== placeId,
      );

      return await this.usersRepository.save(user);
    } else {
      user.vistedPlaces.push(placeId);
      return await this.usersRepository.save(user);
    }
  }
}
