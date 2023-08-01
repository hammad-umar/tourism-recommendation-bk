import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  @Length(2)
  readonly title: string;
}
