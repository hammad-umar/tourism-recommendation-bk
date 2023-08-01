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
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dtos/create-interest.dto';
import { UpdateInterestDto } from './dtos/update-interest.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get('/my-interests')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async getUserInterests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @CurrentUser() { id }: User,
  ) {
    return this.interestsService.getUserInterests({ page, limit }, id);
  }

  @Get()
  async allInterests(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.interestsService.find({
      page,
      limit,
      route: 'http://localhost:1337/interests',
    });
  }

  @Get(':id')
  async singleInterest(@Param('id') id: string) {
    return this.interestsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async createInterest(@Body() createInterestDto: CreateInterestDto) {
    return this.interestsService.create(createInterestDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async updateInterest(
    @Param('id') id: string,
    @Body() updateInterestDto: UpdateInterestDto,
  ) {
    return this.interestsService.update(id, updateInterestDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async deleteInterest(@Param('id') id: string) {
    return this.interestsService.delete(id);
  }

  @Post('/my-interests/:interestId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async addUserInterests(
    @Param('interestId') interestId: string,
    @CurrentUser() { id }: User,
  ) {
    return this.interestsService.addUserInterest(interestId, id);
  }

  @Delete('/my-interests/:interestId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async deleteUserInterest(
    @Param('interestId') interestId: string,
    @CurrentUser() { id }: User,
  ) {
    return this.interestsService.removeUserInterest(interestId, id);
  }
}
