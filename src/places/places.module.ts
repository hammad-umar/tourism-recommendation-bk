import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place } from './place.entity';
import { CategoryModule } from '../category/category.module';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [CategoryModule, TypeOrmModule.forFeature([Place])],
  providers: [PlacesService, FileUploadService],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}
