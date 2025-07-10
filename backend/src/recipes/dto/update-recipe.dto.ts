import { IsArray, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeType } from './create-recipes.dto';

export class UpdateRecipeDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ingredients?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    servings?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietaryRestrictions?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(RecipeType)
    recipeType?: RecipeType;
}