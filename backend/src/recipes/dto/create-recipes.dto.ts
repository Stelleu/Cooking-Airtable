import { IsArray, IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RecipeType {
    APPETIZER = 'Entrée',
    MAIN_COURSE = 'Plat',
    DESSERT = 'Dessert',
}

export class CreateRecipeDto {
    @ApiProperty({
        description: 'List of ingredients for the recipe',
        example: ['chicken breast', 'broccoli', 'rice', 'olive oil']
    })
    @IsArray()
    @IsString({ each: true })
    ingredients: string[];

    @ApiProperty({
        description: 'Number of servings',
        example: 4,
        minimum: 1,
        maximum: 12
    })
    @IsNumber()
    @Min(1)
    @Max(12)
    servings: number;

    @ApiProperty({
        description: 'Dietary restrictions',
        example: ['vegetarian', 'gluten-free'],
        required: false
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietaryRestrictions?: string[];

    @ApiProperty({
        description: 'Type of recipe',
        enum: RecipeType,
        example: RecipeType.MAIN_COURSE
    })
    @IsEnum(RecipeType)
    recipeType: RecipeType;

    @IsOptional()
    @IsNumber()
    preparationTime?: number;

    @IsOptional()
    @IsNumber()
    cookingTime?: number;
}