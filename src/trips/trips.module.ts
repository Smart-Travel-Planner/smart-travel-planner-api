import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { AiService } from 'src/ai/ai.service';

@Module({
  controllers: [TripsController],
  providers: [TripsService, AiService],
  exports: [TripsService],
})
export class TripsModule {}
