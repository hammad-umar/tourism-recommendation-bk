import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsLatitude,
  IsLongitude,
  IsDefined,
  IsObject,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsLatitude()
  readonly latitude: number;

  @IsLongitude()
  readonly longitude: number;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 32)
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 32)
  @IsOptional()
  readonly bio?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  picture?: string;

  @IsDefined()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  readonly location?: LocationDto;
}
