import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DeserializeUserMiddleware } from '../common/middlewares/deserialize-user.middleware';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../common/services/mailer.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES'),
        },
      }),
      inject: [ConfigService],
    }),

    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, MailerService],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeserializeUserMiddleware).forRoutes('*');
  }
}
