import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  confirmPassword: string;
}
