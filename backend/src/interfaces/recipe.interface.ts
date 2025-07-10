export interface Recipe {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string;
    servings: number;
    dietaryRestrictions?: string[];
    recipeType: string;
    preparationTime?: number;
    cookingTime?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface NutritionData {
    id: string;
    caloriesPerServing: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
    analysisDate: Date;
}

export interface RecipeWithNutrition extends Recipe {
    nutrition?: NutritionData;
}