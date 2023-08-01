import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { UsersModule } from '../users/users.module';
import { PlacesModule } from '../places/places.module';

@Module({
  imports: [UsersModule, PlacesModule, TypeOrmModule.forFeature([Rating])],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}
