import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './interest.entity';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interest])],
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
