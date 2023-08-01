import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { PlacesModule } from './places/places.module';
import { InterestsModule } from './interests/interests.module';
import { CategoryModule } from './category/category.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // PORT: Joi.number().required(),
        // JWT_SECRET: Joi.string().required(),
        // JWT_EXPIRES: Joi.string().required(),
        // SQLITE_DATABASE: Joi.string().required(),
        // SQLITE_SYNCHRONIZE: Joi.boolean().required(),
        // CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        // CLOUDINARY_API_KEY: Joi.string().required(),
        // CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),

    DatabaseModule,

    UsersModule,
    AuthModule,
    PlacesModule,
    InterestsModule,
    CategoryModule,
    RatingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
