import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from "./dto/create-recipes.dto";
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeSearchDto } from './dto/recipe-search.dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new recipe with AI generation' })
    @ApiResponse({ status: 201, description: 'Recipe created successfully' })
    async create(@Body(ValidationPipe) createRecipeDto: CreateRecipeDto) {
        return this.recipesService.create(createRecipeDto);
    }
    
    @Post(':id/generate-nutrition')
    async generateNutrition(@Param('id') id: string) {
        return this.recipesService.generateNutritionForRecipe(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all recipes with optional search' })
    @ApiResponse({ status: 200, description: 'Recipes retrieved successfully' })
    async findAll(@Query(ValidationPipe) searchDto: RecipeSearchDto) {
        return this.recipesService.findAll(searchDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a recipe by ID with nutritional analysis' })
    @ApiResponse({ status: 200, description: 'Recipe retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async findOne(@Param('id') id: string) {
        return this.recipesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a recipe' })
    @ApiResponse({ status: 200, description: 'Recipe updated successfully' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateRecipeDto: UpdateRecipeDto,
    ) {
        return this.recipesService.update(id, updateRecipeDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a recipe' })
    @ApiResponse({ status: 200, description: 'Recipe deleted successfully' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async remove(@Param('id') id: string) {
        return this.recipesService.remove(id);
    }
}