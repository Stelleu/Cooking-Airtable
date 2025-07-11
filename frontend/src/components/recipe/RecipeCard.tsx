"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat } from "lucide-react";
import { Recipe } from "@/types/recipe.types";
import Link from "next/link";

interface RecipeCardProps {
    recipe: Recipe;
    onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
    const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);

    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{recipe.name}</CardTitle>
                        <CardDescription className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                                {recipe.recipeType}
                            </Badge>
                        </CardDescription>
                    </div>
                    {onDelete && (
                        <button
                            aria-label="Supprimer la recette"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(recipe.id);
                            }}
                            className="ml-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-1"
                            style={{ cursor: 'pointer' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Informations rapides */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} pers.</span>
                    </div>
                    {totalTime > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{totalTime} min</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4" />
                        <span>{recipe.ingredients.length} ingrédients</span>
                    </div>
                </div>

                {/* Ingrédients principaux */}
                <div>
                    <p className="text-sm font-medium mb-2">Ingrédients principaux :</p>
                    <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {ingredient}
                            </Badge>
                        ))}
                        {recipe.ingredients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{recipe.ingredients.length - 3} autres
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Restrictions alimentaires */}
                {recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Restrictions :</p>
                        <div className="flex flex-wrap gap-1">
                            {recipe.dietaryRestrictions.map((restriction, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                    {restriction}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action */}
                <div className="pt-2">
                    <Link href={`/recipes/${recipe.id}`}>
                        <Button className="w-full" variant="outline">
                            Voir la recette complète
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
