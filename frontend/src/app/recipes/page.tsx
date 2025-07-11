"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { RecipeSearch } from "@/components/search/RecipeSearch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Recipe } from "@/types/recipe.types";
import { toast } from "sonner";

interface SearchFilters {
    name: string;
    ingredient: string;
    recipeType: string;
    dietaryRestrictions: string[];
}

export default function RecipesPage() {
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        name: "",
        ingredient: "",
        recipeType: "",
        dietaryRestrictions: [],
    });
    const { data: recipes, isLoading, error, refetch } = useQuery({
        queryKey: ["recipes", searchFilters],
        queryFn: () => api.searchRecipes(searchFilters),
    });
    // On utilise la liste optimiste pour l'affichage et le compteur
    const [optimisticRecipes, setOptimisticRecipes] = useState<Recipe[] | null>(null);

    useEffect(() => {
        if (recipes) setOptimisticRecipes(recipes);
    }, [recipes]);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.deleteRecipe(id);
            return id;
        },
        onMutate: async (id: string) => {
            setOptimisticRecipes((prev) => prev ? prev.filter(r => r.id !== id) : prev);
        },
        onSuccess: () => {
            toast.success("Recette supprimée avec succès");
        },
        onError: () => {
            toast.error("Erreur lors de la suppression");
            setOptimisticRecipes(recipes || null);
        },
    });

    const handleSearch = (filters: SearchFilters) => {
        setSearchFilters(filters);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Mes Recettes</h1>
                    <Link href="/recipes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle recette
                        </Button>
                    </Link>
                </div>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Une erreur s'est produite lors du chargement des recettes.
                        <Button variant="link" onClick={() => refetch()} className="p-0 ml-2">
                            Réessayer
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mes Recettes</h1>
                    <p className="text-muted-foreground">
                        {optimisticRecipes ? `${optimisticRecipes.length} recette(s) trouvée(s)` : "Chargement..."}
                    </p>
                </div>
                <Link href="/recipes/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle recette
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <RecipeSearch onSearch={handleSearch} isLoading={isLoading} />

            {/* Recipes Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : optimisticRecipes && optimisticRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {optimisticRecipes.map((recipe: Recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aucune recette trouvée</h3>
                    <p className="text-muted-foreground mb-4">
                        {Object.values(searchFilters).some(val => Array.isArray(val) ? val.length > 0 : val)
                            ? "Essayez de modifier vos critères de recherche."
                            : "Commencez par créer votre première recette !"}
                    </p>
                    <Link href="/recipes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Créer ma première recette
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}