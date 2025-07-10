import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import {AirtableModule} from "./airtable/airtable.module";
import {OpenaiModule} from "./ai/ai.module";
import {ConfigModule} from "@nestjs/config";
import {RecipesModule} from "./recipes/recipe.module";
@Module({
  imports: [
      ThrottlerModule.forRoot([ //Pour limiter de requêtes, protection DDoS
        {
          name: 'short',
          ttl: 1000, // 1 seconde
          limit: 10, // 10 requêtes par seconde
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: 100, // 100 requêtes par minute
        },
        {
          name: 'long',
          ttl: 3600000, // 1 heure
          limit: 1000, // 1000 requêtes par heure
        },
      ]),
      AirtableModule,
      OpenaiModule,
      RecipesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
