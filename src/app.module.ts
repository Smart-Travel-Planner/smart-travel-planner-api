import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TripsModule } from './trips/trips.module';
import { LocationsModule } from './locations/locations.module';
import { ActivitiesModule } from './activities/activities.module';
import { TravelRequirementsModule } from './travel-requirements/travel-requirements.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TripMembersModule } from './trip-members/trip-members.module';
import { HealthModule } from './health/health.module';
import { AiService } from './ai/ai.service';
import { AiController } from './ai/ai.controller';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TripsModule,
    LocationsModule,
    ActivitiesModule,
    TravelRequirementsModule,
    TripMembersModule,
    AiModule,
  ],
  controllers: [AiController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AiService,
  ],
})
export class AppModule {}
