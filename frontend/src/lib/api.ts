import { RecipeWithNutrition, Recipe } from "@/types/recipe.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError extends Error {
    status?: number;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error: ApiError = new Error(`HTTP error! status: ${response.status}`);
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Une erreur inattendue s\'est produite');
        }
    }

    // Recipes endpoints
    async getRecipes(params?: Record<string, unknown>): Promise<Recipe[]> {
        const queryParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });
        }

        const queryString = queryParams.toString();
        const endpoint = `/recipes${queryString ? `?${queryString}` : ''}`;

        return this.request<Recipe[]>(endpoint);
    }

    async getRecipe(id: string): Promise<RecipeWithNutrition> {
        return this.request<RecipeWithNutrition>(`/recipes/${id}`);
    }

    async createRecipe(data: {
        ingredients: string[];
        servings: number;
        dietaryRestrictions?: string[];
        recipeType: string;
    }): Promise<RecipeWithNutrition> {
        return this.request<RecipeWithNutrition>('/recipes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRecipe(id: string, data: Partial<{
        name: string;
        ingredients: string[];
        instructions: string;
        servings: number;
        dietaryRestrictions: string[];
        recipeType: string;
    }>): Promise<Recipe> {
        return this.request<Recipe>(`/recipes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteRecipe(id: string): Promise<void> {
        const url = `${this.baseURL}/recipes/${id}`;
        const response = await fetch(url, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            const error: ApiError = new Error(`HTTP error! status: ${response.status}`);
            error.status = response.status;
            throw error;
        }
        // Pas de .json() ici car le backend renvoie probablement un 204 No Content
        return;
    }

    async searchRecipes(filters: {
        name?: string;
        ingredient?: string;
        recipeType?: string;
        dietaryRestrictions?: string[];
    }): Promise<Recipe[]> {
        const params: Record<string, unknown> = {};

        if (filters.name) params.name = filters.name;
        if (filters.ingredient) params.ingredient = filters.ingredient;
        if (filters.recipeType) params.recipeType = filters.recipeType;
        if (filters.dietaryRestrictions) params.dietaryRestrictions = filters.dietaryRestrictions;

        return this.getRecipes(params);
    }

    async getDietaryRestrictions() {
        return this.request<string[]>('/recipes/dietary-restrictions');
    }
}

export const api = new ApiClient(API_BASE_URL);