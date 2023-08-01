import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaceDto } from './create-place.dto';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  readonly removedInterests?: string[];
}
