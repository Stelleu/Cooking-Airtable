"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Activity } from "lucide-react";
import { RecipeWithNutrition } from "@/types/recipe.types";
import { NutritionAnalysis } from "./NutritionAnalysis";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecipeDetailProps {
    recipe: RecipeWithNutrition;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
    const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);
    const [nutrition, setNutrition] = useState(recipe.nutrition);
    const [loading, setLoading] = useState(false);

    const handleGenerateNutrition = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/recipes/${recipe.id}/generate-nutrition`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Erreur lors de la génération");
            const data = await res.json();
            setNutrition(data);
            toast.success("Analyse nutritionnelle générée !");
        } catch (e) {
            toast.error("Impossible de générer l'analyse nutritionnelle.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{recipe.name}</CardTitle>
                            <CardDescription className="mt-2">
                                <Badge variant="secondary">{recipe.recipeType}</Badge>
                            </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>Créé le {new Date(recipe.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Informations rapides */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{recipe.servings}</p>
                            <p className="text-sm text-muted-foreground">Personnes</p>
                        </div>
                        <div className="text-center">
                            <ChefHat className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{recipe.ingredients.length}</p>
                            <p className="text-sm text-muted-foreground">Ingrédients</p>
                        </div>
                        <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{recipe.preparationTime || 0}</p>
                            <p className="text-sm text-muted-foreground">Min préparation</p>
                        </div>
                        <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{recipe.cookingTime || 0}</p>
                            <p className="text-sm text-muted-foreground">Min cuisson</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingrédients */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5" />
                            Ingrédients
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Analyse nutritionnelle */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analyse nutritionnelle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nutrition ? (
                            <NutritionAnalysis nutrition={nutrition} />
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="text-muted-foreground">Aucune analyse nutritionnelle disponible pour cette recette.</p>
                                <Button onClick={handleGenerateNutrition} disabled={loading}>
                                    {loading ? "Génération en cours..." : "Générer l'analyse nutritionnelle"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        {recipe.instructions.split('\n').map((step, index) => (
                            <div key={index} className="mb-4">
                                {step.trim() && (
                                    <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                                        <p className="text-sm leading-relaxed">{step.trim()}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Restrictions alimentaires */}
            {recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Restrictions alimentaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {recipe.dietaryRestrictions.map((restriction, index) => (
                                <Badge key={index} variant="destructive">
                                    {restriction}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}