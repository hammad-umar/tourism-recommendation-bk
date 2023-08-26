import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dtos/create-place.dto';
import { UpdatePlaceDto } from './dtos/update-place.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get('/destinations')
  @UseGuards(JwtAuthGuard)
  async destinationsPlaces(@CurrentUser() user: User) {
    return this.placesService.destinationsPlaces(user.id);
  }

  @Get('/recommendations')
  @UseGuards(JwtAuthGuard)
  async recommendationsPlaces(@CurrentUser() user: User) {
    return this.placesService.recommendationsPlaces(user.id);
  }

  @Patch('/demographics/:placeId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async addDemographics(
    @Param('placeId') id: string,
    @Body() demographicsDto: any,
  ) {
    return this.placesService.addDemographics(demographicsDto, id);
  }

  @Get()
  async allPlaces(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.placesService.find({
      limit,
      page,
      route: 'http://localhost:1337/places',
    });
  }

  @Get('/available')
  async availablePlaces(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('searchTerm') searchTerm: string,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.placesService.availablePlaces(
      {
        limit,
        page,
        route: 'http://localhost:1337/places',
      },
      searchTerm,
    );
  }

  @Get(':id')
  async singlePlace(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async createPlace(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.create(createPlaceDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async updatePlace(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    return this.placesService.update(id, updatePlaceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async deletePlace(@Param('id') id: string) {
    return this.placesService.delete(id);
  }
}
