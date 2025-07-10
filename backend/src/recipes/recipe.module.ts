import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipe.controller';
import { AirtableService } from '../airtable/airtable.service'
import { GptService} from "../ai/ai.service";

@Module({
    controllers: [RecipesController],
    providers: [RecipesService, AirtableService, GptService],
})
export class RecipesModule {}
