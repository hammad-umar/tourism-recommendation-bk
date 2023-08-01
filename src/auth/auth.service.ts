import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../common/dtos/create-user.dto';
import { comparePassword, hashPassword } from '../common/utils/bcrypt.utils';
import { User } from '../users/user.entity';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginResponseType } from '../common/types/login-response.type';
import { UpdateUserDto } from '../common/dtos/update-user.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { EntityManager, MoreThan } from 'typeorm';
import {
  getResetAndHashedTokens,
  getResetPasswordExpire,
} from 'src/common/utils/forgot-password.utils';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MailerService } from '../common/services/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly entityManager: EntityManager,
    private readonly mailerService: MailerService,
  ) {}

  async register(registerUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.findOne({
      where: { email: registerUserDto.email },
    });

    if (user) {
      throw new UnprocessableEntityException('Email is already taken!');
    }

    return this.usersService.create(registerUserDto);
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponseType> {
    const { email, password } = loginUserDto;

    const user = await this.usersService.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Invalid Credentials!');
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid Credentials!');
    }

    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return { token };
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateProfileDto);
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.entityManager.findOne(User, { where: { email } });

    if (!user) {
      throw new NotFoundException('User not found with that email!');
    }

    const { hashedToken, resetToken } = getResetAndHashedTokens();
    const resetPasswordExpire = getResetPasswordExpire();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = resetPasswordExpire;

    await this.entityManager.save(user);

    const message = `Your password reset token is as follows \n\n ${resetToken}\n\n If you have not requested this email, then ignore it.`;

    try {
      await this.mailerService.sendForgotPasswordEmail({
        message,
        to: user.email,
      });

      return { success: true, message: 'Secret token sended on your email!' };
    } catch (error) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await this.entityManager.save(user);

      throw new InternalServerErrorException(error.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { confirmPassword, newPassword, token } = resetPasswordDto;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.entityManager.findOne(User, {
      where: {
        resetPasswordToken,
        resetPasswordExpire: MoreThan(Date.now()),
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Reset password token is invalid or expired!',
      );
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords must be same!');
    }

    user.password = await hashPassword(newPassword);

    user.resetPasswordExpire = null;
    user.resetPasswordToken = null;

    await this.entityManager.save(user);

    return {
      success: true,
      message: 'Password reset successfully!',
    };
  }
}
