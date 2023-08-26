import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
