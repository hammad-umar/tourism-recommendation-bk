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
        // url: 'postgres://hammad-umar:YLISB9vgVt0o@ep-gentle-cloud-66314405.us-east-2.aws.neon.tech/neondb',
        // database: configService.get<string>('SQLITE_DATABASE'),
        database: 'tourismdb',
        username: 'postgres',
        password: '78678612',
        host: 'localhost',
        port: 5432,
        autoLoadEntities: true,
        synchronize: true,
        // synchronize: configService.get<boolean>('SQLITE_SYNCHRONIZE'),
        subscribers: [RatingSubscriber, UserSubscriber],
        // ssl: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
