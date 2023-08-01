import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async find(options: IPaginationOptions): Promise<Pagination<Category>> {
    return paginate<Category>(this.categoryRepository, options);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found!');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const categoryExist = await this.categoryRepository.findOne({
      where: { title: createCategoryDto.title },
    });

    if (categoryExist) {
      throw new BadRequestException('Category already taken!');
    }

    const createdCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(createdCategory);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found!');
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found!');
    }

    return this.categoryRepository.remove(category);
  }
}
