import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Interest } from './interest.entity';
import { CreateInterestDto } from './dtos/create-interest.dto';
import { UpdateInterestDto } from './dtos/update-interest.dto';
import { User } from '../users/user.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestsRepository: Repository<Interest>,
    private readonly entityManager: EntityManager,
  ) {}

  async find(options: IPaginationOptions): Promise<Pagination<Interest>> {
    return paginate<Interest>(this.interestsRepository, options);
  }

  async findOne(id: string): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({ where: { id } });

    if (!interest) {
      throw new NotFoundException('Interest not found!');
    }

    return interest;
  }

  async create(createInterestDto: CreateInterestDto): Promise<Interest> {
    const interestExist = await this.interestsRepository.findOne({
      where: { title: createInterestDto.title },
    });

    if (interestExist) {
      throw new UnprocessableEntityException('Interest is already taken!');
    }

    const interest = this.interestsRepository.create(createInterestDto);
    return this.interestsRepository.save(interest);
  }

  async update(
    id: string,
    updateInterestDto: UpdateInterestDto,
  ): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({ where: { id } });

    if (!interest) {
      throw new NotFoundException('Interest not found!');
    }

    Object.assign(interest, updateInterestDto);
    return this.interestsRepository.save(interest);
  }

  async delete(id: string): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({ where: { id } });

    if (!interest) {
      throw new NotFoundException('Interest not found!');
    }

    return this.interestsRepository.remove(interest);
  }

  async addUserInterest(interestId: string, userId: string): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({
      where: { id: interestId },
      relations: { user: true },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found!');
    }

    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { interests: true },
    });

    const interestAlreadyExist = user.interests.find(
      (interest) => interest.id === interestId,
    );

    if (interestAlreadyExist) {
      throw new BadRequestException('Interest already exist!');
    }

    interest.user = user;
    return this.interestsRepository.save(interest);
  }

  async removeUserInterest(
    interestId: string,
    userId: string,
  ): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({
      where: {
        id: interestId,
        user: { id: userId },
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found!');
    }

    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
      relations: { interests: true },
    });

    user.interests = user.interests.filter(
      (interest) => interest.id !== interestId,
    );

    await this.entityManager.save(user);
    return await this.interestsRepository.save(interest);
  }

  async getUserInterests(options: IPaginationOptions, userId: string) {
    return paginate<Interest>(this.interestsRepository, options, {
      where: {
        user: { id: userId },
      },
    });
  }
}
