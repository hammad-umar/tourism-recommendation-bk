import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from '../common/dtos/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../common/dtos/update-user.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async profileDetails(@CurrentUser() user: User) {
    return user;
  }

  @Patch('/profile/update')
  @UseGuards(JwtAuthGuard)
  async profileUpdate(
    @Body() updateProfileDto: UpdateUserDto,
    @CurrentUser() { id }: User,
  ) {
    return this.authService.updateProfile(id, updateProfileDto);
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
