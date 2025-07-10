import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeType } from './create-recipes.dto';

export class RecipeSearchDto {
    @ApiProperty({ required: false, description: 'Search by recipe name' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false, description: 'Search by ingredient' })
    @IsOptional()
    @IsString()
    ingredient?: string;

    @ApiProperty({ required: false, description: 'Filter by recipe type' })
    @IsOptional()
    @IsEnum(RecipeType)
    recipeType?: RecipeType;

    @ApiProperty({ required: false, description: 'Filter by dietary restrictions', type: [String] })
    @IsOptional()
    dietaryRestrictions?: string[];

}