"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { RecipeWithNutrition } from "@/types/recipe.types";

export default function RecipeDetailPage() {
    const params = useParams();
    const recipeId = params.id as string;

    const { data: recipe, isLoading, error } = useQuery({
        queryKey: ["recipe", recipeId],
        queryFn: () => api.getRecipe(recipeId),
        enabled: !!recipeId,
    }) as { data: RecipeWithNutrition | undefined, isLoading: boolean, error: unknown };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/recipes">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Recette introuvable</h1>
                </div>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Cette recette n&apos;existe pas ou a été supprimée.
                    </AlertDescription>
                </Alert>

                <Link href="/recipes">
                    <Button>Retour aux recettes</Button>
                </Link>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold">Détail de la Recette</h1>
                    <p className="text-muted-foreground">
                        Recette générée par IA avec analyse nutritionnelle
                    </p>
                </div>
            </div>

            {/* Recipe Detail */}
            {recipe && <RecipeDetail recipe={recipe} />}
        </div>
    );
}