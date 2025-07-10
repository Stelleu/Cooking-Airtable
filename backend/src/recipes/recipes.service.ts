import { Injectable, NotFoundException } from '@nestjs/common';
import { AirtableService } from '../airtable/airtable.service';
import { GptService } from '../ai/ai.service';
import {CreateRecipeDto} from "./dto/create-recipes.dto";
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeSearchDto } from './dto/recipe-search.dto';
import { Recipe, RecipeWithNutrition } from '../interfaces/recipe.interface'

@Injectable()
export class RecipesService {
    private readonly recipesTable = 'Recipes';
    private readonly nutritionTable = 'Nutritional_Analysis';

    constructor(
        private readonly airtableService: AirtableService,
        private readonly gptService: GptService,
    ) {}

    async findAll(searchDto?: RecipeSearchDto): Promise<Recipe[]> {
        try {
            let filterFormula = '';

            if (searchDto?.name) {
                filterFormula += `SEARCH(LOWER("${searchDto.name}"), LOWER({name}))`;
            }

            if (searchDto?.ingredient) {
                const ingredientFilter = `SEARCH(LOWER("${searchDto.ingredient}"), LOWER({ingredients}))`;
                filterFormula = filterFormula ? `AND(${filterFormula}, ${ingredientFilter})` : ingredientFilter;
            }

            if (searchDto?.recipeType) {
                const typeFilter = `{recipe_type} = "${searchDto.recipeType}"`;
                filterFormula = filterFormula ? `AND(${filterFormula}, ${typeFilter})` : typeFilter;
            }

            let dietaryRestrictions = searchDto?.dietaryRestrictions;
            if (typeof dietaryRestrictions === "string") {
                dietaryRestrictions = [dietaryRestrictions];
            }
            if (!Array.isArray(dietaryRestrictions)) {
                dietaryRestrictions = [];
            }

            if (dietaryRestrictions.length > 0) {
                const restrictionsFilter = dietaryRestrictions
                    .map(restriction => `FIND("${restriction}", ARRAYJOIN({dietary_restrictions}, ","))`)
                    .join(', ');
                filterFormula = filterFormula ? `AND(${filterFormula}, OR(${restrictionsFilter}))` : `OR(${restrictionsFilter})`;
            }

            const options: any = {
                sort: [{ field: 'created_at', direction: 'desc' }],
            };
            
            if (filterFormula) {
                options.filterByFormula = filterFormula;
            }

            const records = await this.airtableService.getRecords(this.recipesTable, options);
            return records.map(record => this.mapAirtableRecordToRecipe(record));
        } catch (error) {
            throw new Error(`Failed to fetch recipes: ${error.message}`);
        }
    }

    async findOne(id: string): Promise<RecipeWithNutrition> {
        try {
            const recipeRecord = await this.airtableService.getRecord(this.recipesTable, id);
            if (!recipeRecord) {
                throw new NotFoundException(`Recipe with ID ${id} not found`);
            }

            const recipe = this.mapAirtableRecordToRecipe(recipeRecord);

            // Fetch nutritional analysis
            const nutritionRecords = await this.airtableService.getRecords(this.nutritionTable, {
                filterByFormula: `{recipe_id} = "${id}"`,
                sort: []
            });

            const nutrition = nutritionRecords.length > 0
                ? this.mapAirtableRecordToNutrition(nutritionRecords[0])
                : null;

            return { ...recipe, nutrition };
        } catch (error) {
            const msg = typeof error.message === 'string' ? error.message : '';
            if (
                error instanceof NotFoundException ||
                msg.includes('Could not find what you are looking for') ||
                msg.includes('not authorized to perform this operation')
            ) {
                throw new NotFoundException(`Recipe with ID ${id} not found`);
            }
            throw new Error(`Failed to fetch recipe: ${error.message}`);
        }
    }

    async create(createRecipeDto: CreateRecipeDto): Promise<RecipeWithNutrition> {
        try {
            // Generate recipe using AI
            const generatedRecipe = await this.gptService.generateRecipe({
                ingredients: createRecipeDto.ingredients,
                servings: createRecipeDto.servings,
                dietaryRestrictions: createRecipeDto.dietaryRestrictions,
                recipeType: createRecipeDto.recipeType,
            });

            // Filtrer les restrictions alimentaires pour ne garder que celles autorisées
            const allowedRestrictions = this.filterAllowedRestrictions(createRecipeDto.dietaryRestrictions || []);

            // Map recipe type to valid Airtable options or use default
            const validRecipeType = this.mapRecipeTypeToAllowedOption(createRecipeDto.recipeType);

            // Save recipe to Airtable
            const recipeData: any = {
                name: generatedRecipe.name,
                ingredients: JSON.stringify(generatedRecipe.ingredients),
                instructions: generatedRecipe.instructions,
                servings: createRecipeDto.servings,
                dietary_restrictions: allowedRestrictions,
                preparation_time: generatedRecipe.preparationTime,
                cooking_time: generatedRecipe.cookingTime,
            };
            
            // Only add recipe_type if we have a valid option
            if (validRecipeType) {
                recipeData.recipe_type = validRecipeType;
            }

            const createdRecord = await this.airtableService.createRecord(this.recipesTable, recipeData);
            const recipe = this.mapAirtableRecordToRecipe(createdRecord);

            // Generate nutritional analysis
            const nutritionAnalysis = await this.gptService.analyzeNutrition({
                ingredients: generatedRecipe.ingredients,
                servings: createRecipeDto.servings,
            });

            // Try to save nutritional analysis, but don't fail if it doesn't work
            let nutrition: any = null;
            try {
                const nutritionData = {
                    recipe_id: [recipe.id],
                    calories_per_serving: nutritionAnalysis.caloriesPerServing,
                    proteins_g: nutritionAnalysis.proteins,
                    carbohydrates_g: nutritionAnalysis.carbohydrates,
                    fats_g: nutritionAnalysis.fats,
                    fiber_g: nutritionAnalysis.fiber,
                    vitamins: JSON.stringify(nutritionAnalysis.vitamins),
                    minerals: JSON.stringify(nutritionAnalysis.minerals),
                };

                const nutritionRecord = await this.airtableService.createRecord(this.nutritionTable, nutritionData);
                nutrition = this.mapAirtableRecordToNutrition(nutritionRecord);
            } catch (nutritionError) {
                console.warn('Failed to save nutritional analysis:', nutritionError.message);
                // Create a nutrition object from the analysis without saving to Airtable
                nutrition = {
                    id: 'temp-' + Date.now(),
                    caloriesPerServing: nutritionAnalysis.caloriesPerServing,
                    proteins: nutritionAnalysis.proteins,
                    carbohydrates: nutritionAnalysis.carbohydrates,
                    fats: nutritionAnalysis.fats,
                    fiber: nutritionAnalysis.fiber,
                    vitamins: nutritionAnalysis.vitamins,
                    minerals: nutritionAnalysis.minerals,
                    analysisDate: new Date(),
                };
            }

            return { ...recipe, nutrition };
        } catch (error) {
            throw new Error(`Failed to create recipe: ${error.message}`);
        }
    }
    private filterAllowedRestrictions(restrictions: string[]): string[] {
        const allowedOptions = [
            'Végétarien',
            'Vegan',
            'Sans gluten',
            'Sans lactose',
            'Halal',
            'Casher',
            'Sans sucre',
            'Cétogène',
            'Paleo',
            'Sans noix'
        ];

        return restrictions.filter(restriction =>
            allowedOptions.includes(restriction)
        );
    }

    async generateNutritionForRecipe(id: string) {
        const recipe = await this.airtableService.getRecord(this.recipesTable, id);
        if (!recipe) throw new NotFoundException("Recette non trouvée");
        // Appelle l'IA pour générer l'analyse
        const nutrition = await this.gptService.analyzeNutrition({
          ingredients: JSON.parse(recipe.fields.ingredients),
          servings: recipe.fields.servings,
        });
        // Sauvegarde dans Airtable
        const nutritionData = {
          recipe_id: [id],
          calories_per_serving: nutrition.caloriesPerServing,
          proteins_g: nutrition.proteins,
          carbohydrates_g: nutrition.carbohydrates,
          fats_g: nutrition.fats,
          fiber_g: nutrition.fiber,
          vitamins: JSON.stringify(nutrition.vitamins),
          minerals: JSON.stringify(nutrition.minerals),
        };
        const nutritionRecord = await this.airtableService.createRecord(this.nutritionTable, nutritionData);
        return this.mapAirtableRecordToNutrition(nutritionRecord);
      }

    async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
        try {
            const updateData: any = {};

            if (updateRecipeDto.name) updateData.name = updateRecipeDto.name;
            if (updateRecipeDto.ingredients) updateData.ingredients = JSON.stringify(updateRecipeDto.ingredients);
            if (updateRecipeDto.instructions) updateData.instructions = updateRecipeDto.instructions;
            if (updateRecipeDto.servings) updateData.servings = updateRecipeDto.servings;
            if (updateRecipeDto.dietaryRestrictions) updateData.dietary_restrictions = updateRecipeDto.dietaryRestrictions;
            if (updateRecipeDto.recipeType) updateData.recipe_type = updateRecipeDto.recipeType;

            const updatedRecord = await this.airtableService.updateRecord(this.recipesTable, id, updateData);
            return this.mapAirtableRecordToRecipe(updatedRecord);
        } catch (error) {
            const msg = typeof error.message === 'string' ? error.message : '';
            if (
                error instanceof NotFoundException ||
                msg.includes('Could not find what you are looking for') ||
                msg.includes('not authorized to perform this operation')
            ) {
                throw new NotFoundException(`Recipe with ID ${id} not found`);
            }
            throw new Error(`Failed to update recipe: ${error.message}`);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            // Delete nutritional analysis first
            const nutritionRecords = await this.airtableService.getRecords(this.nutritionTable, {
                filterByFormula: `{recipe_id} = "${id}"`,
            });

            for (const record of nutritionRecords) {
                await this.airtableService.deleteRecord(this.nutritionTable, record.id);
            }

            // Delete recipe
            await this.airtableService.deleteRecord(this.recipesTable, id);
        } catch (error) {
            const msg = typeof error.message === 'string' ? error.message : '';
            if (
                error instanceof NotFoundException ||
                msg.includes('Could not find what you are looking for') ||
                msg.includes('not authorized to perform this operation')
            ) {
                throw new NotFoundException(`Recipe with ID ${id} not found`);
            }
            throw new Error(`Failed to delete recipe: ${error.message}`);
        }
    }

    private mapAirtableRecordToRecipe(record: any): Recipe {
        // Handle ingredients parsing - try JSON first, fallback to comma-separated string
        let ingredients: string[] = [];
        if (record.fields.ingredients) {
            try {
                ingredients = JSON.parse(record.fields.ingredients);
            } catch (error) {
                // If JSON parsing fails, treat as comma-separated string
                ingredients = record.fields.ingredients.split(',').map((ingredient: string) => ingredient.trim());
            }
        }

        return {
            id: record.id,
            name: record.fields.name,
            ingredients: ingredients,
            instructions: record.fields.instructions,
            servings: record.fields.servings,
            dietaryRestrictions: record.fields.dietary_restrictions || [],
            recipeType: record.fields.recipe_type,
            preparationTime: record.fields.preparation_time,
            cookingTime: record.fields.cooking_time,
            createdAt: new Date(record.fields.created_at),
            updatedAt: new Date(record.fields.updated_at),
        };
    }

    private mapRecipeTypeToAllowedOption(recipeType: string): string | null {
        const allowedTypes = [
            'Entrée',
            'Plat principal',
            'Dessert',
            'Salade',
            'Soupe',
            'Pâtes',
            'Riz',
            'Poulet',
            'Poisson',
            'Viande',
            'Légumes'
            // Ajoute ici tous les types autorisés dans Airtable
        ];

        // Si tu utilises un mapping (français → anglais), fais-le ici
        const mapping: Record<string, string> = {
            'Appetizer': 'Entrée',
            'Main Course': 'Plat principal',
            'Dessert': 'Dessert',
            // etc.
        };

        // Si la valeur reçue est déjà autorisée
        if (allowedTypes.includes(recipeType)) {
            return recipeType;
        }
        // Sinon, essaie de la mapper
        if (mapping[recipeType] && allowedTypes.includes(mapping[recipeType])) {
            return mapping[recipeType];
        }
        // Sinon, ne rien envoyer
        return null;
    }

    private mapAirtableRecordToNutrition(record: any): any {
        return {
            id: record.id,
            caloriesPerServing: record.fields.calories_per_serving,
            proteins: record.fields.proteins_g,
            carbohydrates: record.fields.carbohydrates_g,
            fats: record.fields.fats_g,
            fiber: record.fields.fiber_g,
            vitamins: JSON.parse(record.fields.vitamins || '{}'),
            minerals: JSON.parse(record.fields.minerals || '{}'),
            analysisDate: new Date(record.fields.analysis_date),
        };
    }

}