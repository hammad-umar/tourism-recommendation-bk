import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CreateRatingDto } from './dtos/create-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':placeId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async createNewRating(
    @Param('placeId') placeId: string,
    @CurrentUser() { id: userId }: User,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(placeId, userId, createRatingDto);
  }

  @Get('/all/:placeId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async getAllRatings(
    @Param('placeId') placeId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.ratingsService.find(
      {
        limit,
        page,
        route: 'http://localhost:1337/places',
      },
      placeId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async getSingleRating(
    @Param('id') id: string,
    @CurrentUser() { id: userId }: User,
  ) {
    return this.ratingsService.findOne(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async deleteRating(
    @Param('id') id: string,
    @CurrentUser() { id: userId }: User,
  ) {
    return this.ratingsService.delete(id, userId);
  }
}
