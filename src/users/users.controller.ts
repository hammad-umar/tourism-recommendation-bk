import {
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/toggle-like/:placeId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async toggleLikePost(
    @Param('placeId') placeId: string,
    @CurrentUser() { id: userId }: User,
  ) {
    return this.usersService.toggleLikePlace(placeId, userId);
  }

  @Post('/toggle-visit/:placeId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async toggleVisitPlace(
    @Param('placeId') placeId: string,
    @CurrentUser() { id: userId }: User,
  ) {
    return this.usersService.toggleVisitPlace(placeId, userId);
  }

  @Get('/places-history')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TOURIST)
  async getUserHistory(@CurrentUser() { id: userId }: User) {
    return this.usersService.getUserHistory(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    limit = limit > 100 ? 100 : limit;
    return this.usersService.find({
      page,
      limit,
      route: 'http://localhost:1337/users',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async getSingleUser(@Param('id') id: string) {
    return this.usersService.findOne({ where: { id } });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
