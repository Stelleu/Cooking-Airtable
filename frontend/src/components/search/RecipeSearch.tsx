"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SearchFilters {
    name: string;
    ingredient: string;
    recipeType: string;
    dietaryRestrictions: string[];
}

interface RecipeSearchProps {
    onSearch: (filters: SearchFilters) => void;
    isLoading?: boolean;
}

export function RecipeSearch({ onSearch, isLoading = false }: RecipeSearchProps) {
    const [filters, setFilters] = useState<SearchFilters>({
        name: "",
        ingredient: "",
        recipeType: "",
        dietaryRestrictions: [],
    });

    const [showFilters, setShowFilters] = useState(false);

    // Recherche réactive sur les restrictions alimentaires
    useEffect(() => {
        onSearch(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.dietaryRestrictions]);

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            name: "",
            ingredient: "",
            recipeType: "",
            dietaryRestrictions: [],
        };
        setFilters(clearedFilters);
        onSearch(clearedFilters);
    };

    const addDietaryRestriction = (restriction: string) => {
        if (restriction && !filters.dietaryRestrictions.includes(restriction)) {
            setFilters(prev => ({
                ...prev,
                dietaryRestrictions: [...prev.dietaryRestrictions, restriction]
            }));
        }
    };

    const removeDietaryRestriction = (restriction: string) => {
        setFilters(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction)
        }));
    };

    const hasActiveFilters = filters.name || filters.ingredient || filters.recipeType || filters.dietaryRestrictions.length > 0;

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Recherche principale */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="Rechercher une recette..."
                                value={filters.name}
                                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtres
                        </Button>
                        <Button onClick={handleSearch} disabled={isLoading}>
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                        </Button>
                    </div>

                    {/* Filtres avancés */}
                    {showFilters && (
                        <div className="space-y-4 p-4 bg-muted rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Ingrédient</label>
                                    <Input
                                        placeholder="Ex: poulet, tomate..."
                                        value={filters.ingredient}
                                        onChange={(e) => setFilters(prev => ({ ...prev, ingredient: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Type de plat</label>
                                    <Select
                                        value={filters.recipeType}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, recipeType: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir le type de plat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Entrée">Entrée</SelectItem>
                                            <SelectItem value="Plat">Plat principal</SelectItem>
                                            <SelectItem value="Dessert">Dessert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Restrictions alimentaires</label>
                                <div className="flex gap-2 mb-2">
                                    {["Végétarien", "Vegan", "Sans gluten", "Sans lactose", "Halal", "Casher"].map((restriction) => (
                                        <Button
                                            key={restriction}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDietaryRestriction(restriction)}
                                            disabled={filters.dietaryRestrictions.includes(restriction)}
                                        >
                                            {restriction}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.dietaryRestrictions.map((restriction) => (
                                        <Badge key={restriction} variant="secondary">
                                            {restriction}
                                            <button
                                                onClick={() => removeDietaryRestriction(restriction)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {hasActiveFilters && (
                        <div className="flex justify-end">
                            <Button variant="ghost" onClick={handleClearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Effacer les filtres
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}