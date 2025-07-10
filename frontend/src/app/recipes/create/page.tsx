"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/recipe/RecipeForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface CreateRecipeData {
    ingredients: string[];
    servings: number;
    dietaryRestrictions?: string[];
    recipeType: string;
}

export default function CreateRecipePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const createRecipeMutation = useMutation({
        mutationFn: (data: CreateRecipeData) => api.createRecipe(data),
        onSuccess: (recipe) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] });
            router.push(`/recipes/${recipe.id}`);
        },
    });

    const handleSubmit = async (data: CreateRecipeData) => {
        await createRecipeMutation.mutateAsync(data);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/recipes">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Créer une Nouvelle Recette</h1>
                    <p className="text-muted-foreground">
                        Laissez l'IA créer une recette personnalisée pour vous
                    </p>
                </div>
            </div>

            {/* Form */}
            <RecipeForm
                onSubmit={handleSubmit}
                isLoading={createRecipeMutation.isPending}
            />

            {/* Error handling */}
            {createRecipeMutation.error && (
                <div className="text-center">
                    <p className="text-red-500">
                        Une erreur s'est produite : {createRecipeMutation.error.message}
                    </p>
                </div>
            )}
        </div>
    );
}
