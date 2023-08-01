import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 32)
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  readonly password: string;
}
