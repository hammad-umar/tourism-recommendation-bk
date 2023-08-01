import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Picture } from '../common/entities/picture.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { Place } from '../places/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Picture, Place])],
  providers: [UsersService, FileUploadService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
