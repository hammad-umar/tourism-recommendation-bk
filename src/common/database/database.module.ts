import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RatingSubscriber } from '../../ratings/rating.subscriber';
import { UserSubscriber } from '../../users/user.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URL'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('POSTGRES_SYNCHRONIZE'),
        subscribers: [RatingSubscriber, UserSubscriber],
        ssl: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
