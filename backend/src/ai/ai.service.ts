import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GenerateRecipeRequest {
    ingredients: string[];
    servings: number;
    dietaryRestrictions?: string[];
    recipeType: string;
}

interface GeneratedRecipe {
    name: string;
    ingredients: string[];
    instructions: string;
    preparationTime: number;
    cookingTime: number;
}

interface NutritionAnalysisRequest {
    ingredients: string[];
    servings: number;
}

interface NutritionAnalysis {
    caloriesPerServing: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
}
interface GroqResponse {
    choices: Array<{
        message?: {
            content?: string;
        };
    }>;
    error?: {
        message: string;
    };
}
@Injectable()
export class GptService implements OnModuleInit {
    private readonly logger = new Logger(GptService.name);

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        this.logger.log('GptService initialized with Groq');
    }

    async generateRecipe(request: GenerateRecipeRequest): Promise<GeneratedRecipe> {
        try {
            const ask = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama3-8b-8192', // Free model
                        messages: [
                            {
                                role: 'system',
                                content:
                                    'Tu es un chef cuisinier professionnel expert en création de recettes. \n' +
                                    'Tu dois créer des recettes délicieuses, équilibrées et adaptées aux contraintes données.\n' +
                                    'Réponds UNIQUEMENT avec un JSON valide selon le format demandé.'
                            },
                            {
                                role: 'user',
                                content: this.buildRecipePrompt(request),
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                    }),
                },
            );
            const response = (await ask.json()) as GroqResponse;
            
            if (response.error) {
                throw new Error(response.error.message || 'Groq API error');
            }
            
            const cleanedResponse = this.extractJsonFromResponse(response);
            const recipe = JSON.parse(cleanedResponse);
            return this.validateGeneratedRecipe(recipe);
        } catch (error) {
            this.logger.error('Groq API Error:', error);
            return this.generateFallbackRecipe(request);
        }
    }
    async analyzeNutrition(request: NutritionAnalysisRequest): Promise<NutritionAnalysis> {
        try {
            const ask = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama3-8b-8192',
                        messages: [
                            {
                                role: 'system',
                                content:
                                    'Tu es un nutritionniste expert en analyse de recettes. \n' +
                                    'Tu dois fournir une analyse nutritionnelle précise et détaillée selon les contraintes données.\n' +
                                    'Réponds UNIQUEMENT avec un JSON valide selon le format demandé.'
                            },
                            {
                                role: 'user',
                                content: this.buildNutritionPrompt(request),
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                    }),
                },
            );

            const response = (await ask.json()) as GroqResponse;
            
            if (response.error) {
                throw new Error(response.error.message || 'Groq API error');
            }
            
            const cleanedResponse = this.extractJsonFromResponse(response);
            const nutrition = JSON.parse(cleanedResponse);

            return this.validateNutritionAnalysis(nutrition);
        } catch (error) {
            this.logger.error('Groq API Error:', error);
            return this.generateBasicNutritionAnalysis(request);
        }
    }
    private buildRecipePrompt(request: GenerateRecipeRequest): string {
        const restrictionsText = request.dietaryRestrictions?.length
            ? `\nRestrictions alimentaires à respecter ABSOLUMENT : ${request.dietaryRestrictions.join(', ')}`
            : '';
        return `
            Crée une recette de cuisine française délicieuse avec les contraintes suivantes :
            
            INGRÉDIENTS OBLIGATOIRES À UTILISER : ${request.ingredients.join(', ')}
            NOMBRE DE PERSONNES : ${request.servings}
            TYPE DE PLAT : ${request.recipeType}${restrictionsText}
            RÈGLES IMPORTANTES :
            - Utilise TOUS les ingrédients fournis comme base de la recette
            - Ajoute les ingrédients complémentaires nécessaires (épices, assaisonnements, huile, etc.)
            - Respecte scrupuleusement toutes les restrictions alimentaires mentionnées
            - Crée une recette équilibrée et savoureuse
            - Donne des instructions précises étape par étape
            - Indique des quantités réalistes pour chaque ingrédient
            - Estime des temps de préparation et cuisson réalistes selon la complexité de la recette
            - Les temps doivent varier selon le type de plat et la complexité
            
            FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement, sans texte supplémentaire) :
            {
              "name": "Nom appétissant de la recette",
              "ingredients": [
                "250g de [ingrédient 1]",
                "2 cuillères à soupe de [ingrédient 2]",
                "1 pincée de [épice]"
              ],
              "instructions": "Étape 1: [action détaillée]\\nÉtape 2: [action détaillée]\\nÉtape 3: [action détaillée]\\n[...autres étapes...]",
              "preparationTime": [nombre_en_minutes_selon_complexité],
              "cookingTime": [nombre_en_minutes_selon_cuisson]
            }`;
    }
    private buildNutritionPrompt(request: NutritionAnalysisRequest): string {
        return `
            Analyse la valeur nutritionnelle de cette recette avec précision scientifique :
            
            INGRÉDIENTS : ${request.ingredients.join(', ')}
            NOMBRE DE PORTIONS : ${request.servings}
            
            INSTRUCTIONS :
            - Calcule les valeurs nutritionnelles PAR PORTION
            - Base-toi sur les données nutritionnelles USDA
            - Sois précis dans les calculs
            - Inclus les vitamines et minéraux les plus significatifs
            - Utilise des valeurs réalistes et cohérentes

            FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement) :
            {
              "caloriesPerServing": [nombre_entier],
              "proteins": [grammes_avec_1_décimale],
              "carbohydrates": [grammes_avec_1_décimale],
              "fats": [grammes_avec_1_décimale],
              "fiber": [grammes_avec_1_décimale],
              "vitamins": {
                "A": [milligrammes],
                "C": [milligrammes],
                "D": [milligrammes],
                "E": [milligrammes],
                "B1": [milligrammes],
                "B2": [milligrammes],
                "B6": [milligrammes],
                "B12": [milligrammes],
                "Folate": [milligrammes]
              },
              "minerals": {
                "Calcium": [milligrammes],
                "Fer": [milligrammes],
                "Magnésium": [milligrammes],
                "Potassium": [milligrammes],
                "Zinc": [milligrammes]
              }
            }`;
    }

    private extractJsonFromResponse(response: GroqResponse): string {
        try {
            // Check if response has the expected structure
            if (!response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
                throw new Error('Invalid response structure: missing choices array');
            }

            if (!response.choices[0] || !response.choices[0].message) {
                throw new Error('Invalid response structure: missing message in first choice');
            }

            // Supprimer les éventuels backticks et texte avant/après le JSON
            let cleaned = response.choices[0].message.content || '';

            if (!cleaned) {
                throw new Error('Empty response content');
            }

            // Rechercher le JSON entre accolades
            const jsonStart = cleaned.indexOf('{');
            const jsonEnd = cleaned.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
            }

            // Nettoyer les caractères problématiques
            cleaned = cleaned
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .replace(/\n\s*\/\/.*$/gm, '') // Supprimer les commentaires
                .trim();

            if (!cleaned) {
                throw new Error('No valid JSON found in response');
            }

            return cleaned;
        } catch (error) {
            throw new Error(`Failed to extract JSON from response: ${error.message}`);
        }
    }

    private validateGeneratedRecipe(recipe: any): GeneratedRecipe {
        if (!recipe.name || typeof recipe.name !== 'string') {
            throw new Error('Invalid recipe name');
        }

        if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
            throw new Error('Invalid ingredients list');
        }

        if (!recipe.instructions || typeof recipe.instructions !== 'string') {
            throw new Error('Invalid instructions');
        }

        // Valeurs par défaut si manquantes
        if (typeof recipe.preparationTime !== 'number' || recipe.preparationTime < 0) {
            recipe.preparationTime = 20;
        }

        if (typeof recipe.cookingTime !== 'number' || recipe.cookingTime < 0) {
            recipe.cookingTime = 25;
        }

        return {
            name: recipe.name.trim(),
            ingredients: recipe.ingredients.map((ing: string) => ing.trim()),
            instructions: recipe.instructions.trim(),
            preparationTime: recipe.preparationTime,
            cookingTime: recipe.cookingTime,
        };
    }
    private validateNutritionAnalysis(nutrition: any): NutritionAnalysis {
        return {
            caloriesPerServing: this.validateNumber(nutrition.caloriesPerServing, 200),
            proteins: this.validateNumber(nutrition.proteins, 10),
            carbohydrates: this.validateNumber(nutrition.carbohydrates, 30),
            fats: this.validateNumber(nutrition.fats, 8),
            fiber: this.validateNumber(nutrition.fiber, 3),
            vitamins: this.validateObject(nutrition.vitamins, {
                A: 0.1, C: 5, D: 0.001, E: 1, B1: 0.1, B2: 0.1, B6: 0.1, B12: 0.001, Folate: 0.05
            }),
            minerals: this.validateObject(nutrition.minerals, {
                Calcium: 50, Fer: 2, Magnésium: 25, Potassium: 200, Zinc: 1
            }),
        };
    }

    private validateNumber(value: any, defaultValue: number): number {
        const num = parseFloat(value);
        return (!isNaN(num) && num >= 0) ? Math.round(num * 10) / 10 : defaultValue;
    }

    private validateObject(value: any, defaultValue: Record<string, number>): Record<string, number> {
        if (typeof value === 'object' && value !== null) {
            const result: Record<string, number> = {};
            Object.keys(defaultValue).forEach(key => {
                result[key] = this.validateNumber(value[key], defaultValue[key]);
            });
            return result;
        }
        return defaultValue;
    }

    private generateFallbackRecipe(request: GenerateRecipeRequest): GeneratedRecipe {
        const mainIngredient = request.ingredients[0] || 'ingrédients mélangés';
        
        // Générer des temps variables selon le type de plat
        let prepTime = 15;
        let cookTime = 25;
        
        switch (request.recipeType) {
            case 'Entrée':
                prepTime = Math.floor(Math.random() * 10) + 10; // 10-20 min
                cookTime = Math.floor(Math.random() * 15) + 10; // 10-25 min
                break;
            case 'Plat':
                prepTime = Math.floor(Math.random() * 15) + 15; // 15-30 min
                cookTime = Math.floor(Math.random() * 30) + 20; // 20-50 min
                break;
            case 'Dessert':
                prepTime = Math.floor(Math.random() * 20) + 20; // 20-40 min
                cookTime = Math.floor(Math.random() * 20) + 15; // 15-35 min
                break;
        }

        return {
            name: `${request.recipeType} aux ${mainIngredient}`,
            ingredients: [
                ...request.ingredients.map(ing => `200g de ${ing}`),
                '2 cuillères à soupe d\'huile d\'olive',
                'Sel et poivre selon le goût',
                '1 gousse d\'ail',
                'Herbes de Provence'
            ],
            instructions: `Étape 1: Préparer tous les ingrédients en les lavant et coupant si nécessaire.
                Étape 2: Faire chauffer l'huile dans une poêle à feu moyen.
                Étape 3: Ajouter l'ail émincé et faire revenir 1 minute.
                Étape 4: Incorporer les ingrédients principaux et cuire selon leur nature.
                Étape 5: Assaisonner avec sel, poivre et herbes de Provence.
                Étape 6: Laisser mijoter jusqu'à cuisson complète.
                Étape 7: Servir chaud avec accompagnement de votre choix.`,
            preparationTime: prepTime,
            cookingTime: cookTime,
        };
    }

    private generateBasicNutritionAnalysis(request: NutritionAnalysisRequest): NutritionAnalysis {
        // Estimation basique basée sur des moyennes
        const baseCalories = request.ingredients.length * 50;

        return {
            caloriesPerServing: Math.round(baseCalories / request.servings),
            proteins: Math.round((baseCalories * 0.15) / 4 / request.servings * 10) / 10,
            carbohydrates: Math.round((baseCalories * 0.55) / 4 / request.servings * 10) / 10,
            fats: Math.round((baseCalories * 0.30) / 9 / request.servings * 10) / 10,
            fiber: Math.round(3 / request.servings * 10) / 10,
            vitamins: {
                A: 0.1, C: 5, D: 0.001, E: 1, B1: 0.1, B2: 0.1, B6: 0.1, B12: 0.001, Folate: 0.05
            },
            minerals: {
                Calcium: 50, Fer: 2, Magnésium: 25, Potassium: 200, Zinc: 1
            },
        };
    }
}
