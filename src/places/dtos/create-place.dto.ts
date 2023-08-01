import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class LocationDto {
  @IsLatitude()
  readonly latitude: number;

  @IsLongitude()
  readonly longitude: number;
}

export class CreatePlaceDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  readonly location: LocationDto;

  @IsString()
  @IsNotEmpty()
  readonly category: string;

  @IsString()
  @IsNotEmpty()
  readonly picture: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  readonly interests: string[];
}
