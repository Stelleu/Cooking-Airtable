"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from 'sonner';
import { api } from "@/lib/api";

const formSchema = z.object({
    ingredients: z.array(z.string()).min(1, "Au moins un ingrédient requis"),
    servings: z.number().min(1).max(12),
    dietaryRestrictions: z.array(z.string()).optional(),
    recipeType: z.enum(["Entrée", "Plat", "Dessert"]),
    preparationTime: z.number().optional(),
    cookingTime: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RecipeFormProps {
    onSubmit: (data: FormData) => Promise<void>;
    isLoading?: boolean;
}

export function RecipeForm({ onSubmit, isLoading = false }: RecipeFormProps) {
    const [currentIngredient, setCurrentIngredient] = useState("");
    const [selectedRestriction, setSelectedRestriction] = useState("");
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
    const [loadingRestrictions, setLoadingRestrictions] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
        getValues,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ingredients: [],
            servings: 4,
            dietaryRestrictions: [],
            recipeType: "Plat",
        },
    });

    const ingredients = watch("ingredients");
    const selectedDietaryRestrictions = watch("dietaryRestrictions");

    // Charger les restrictions alimentaires depuis l'API
    useEffect(() => {
        const loadDietaryRestrictions = async () => {
            try {
                const restrictions = await api.getDietaryRestrictions();
                console.log('Loaded dietary restrictions:', restrictions);
                setDietaryRestrictions(restrictions);
            } catch (error) {
                console.error('Erreur lors du chargement des restrictions alimentaires:', error);
                toast.error("Impossible de charger les restrictions alimentaires");
            } finally {
                setLoadingRestrictions(false);
            }
        };

        loadDietaryRestrictions();
    }, []);

    const addIngredient = () => {
        if (currentIngredient.trim()) {
            const newIngredients = [...ingredients, currentIngredient.trim()];
            setValue("ingredients", newIngredients);
            setCurrentIngredient("");
        }
    };

    const removeIngredient = (index: number) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setValue("ingredients", newIngredients);
    };

    const addRestriction = () => {
        if (selectedRestriction && !selectedDietaryRestrictions?.includes(selectedRestriction)) {
            const newRestrictions = [...(selectedDietaryRestrictions || []), selectedRestriction];
            setValue("dietaryRestrictions", newRestrictions);
            setSelectedRestriction("");
        }
    };

    const removeRestriction = (restriction: string) => {
        const newRestrictions = (selectedDietaryRestrictions || []).filter((r: string) => r !== restriction);
        setValue("dietaryRestrictions", newRestrictions);
    };

    const handleFormSubmit = async (data: FormData) => {
        console.log('Form data being submitted:', data);
        console.log('Selected dietary restrictions from state:', selectedDietaryRestrictions);
        
        // S'assurer que les restrictions sont bien dans les données
        const formDataWithRestrictions = {
            ...data,
            dietaryRestrictions: selectedDietaryRestrictions || []
        };
        
        try {
            await onSubmit(formDataWithRestrictions);
            reset();
            toast.success("Recette créée avec succès!", {
                description: "Votre nouvelle recette a été générée par l'IA."
            });
        } catch (error) {
            toast.error("Erreur lors de la création de la recette", {
                description: "Une erreur s'est produite lors de la création de la recette."
            });
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Créer une Nouvelle Recette</CardTitle>
                <CardDescription>
                    Renseignez les ingrédients et préférences, l'IA se chargera du reste !
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Ingrédients */}
                    <div className="space-y-2">
                        <Label htmlFor="ingredients">Ingrédients</Label>
                        <div className="flex gap-2">
                            <Input
                                id="ingredients"
                                value={currentIngredient}
                                onChange={(e) => setCurrentIngredient(e.target.value)}
                                placeholder="Ex: poulet, brocolis, riz..."
                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                            />
                            <Button type="button" onClick={addIngredient} variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.ingredients && (
                            <p className="text-sm text-red-500">{errors.ingredients.message}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {ingredients.map((ingredient, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                    {ingredient}
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className="ml-1 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Nombre de personnes */}
                    <div className="space-y-2">
                        <Label htmlFor="servings">Nombre de personnes</Label>
                        <Input
                            id="servings"
                            type="number"
                            min={1}
                            max={12}
                            {...register("servings", { valueAsNumber: true })}
                        />
                        {errors.servings && (
                            <p className="text-sm text-red-500">{errors.servings.message}</p>
                        )}
                    </div>

                    {/* Type de recette */}
                    <div className="space-y-2">
                        <Label htmlFor="recipeType">Type de plat</Label>
                        <Select onValueChange={(value) => setValue("recipeType", value as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir le type de plat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Entrée">Entrée</SelectItem>
                                <SelectItem value="Plat">Plat principal</SelectItem>
                                <SelectItem value="Dessert">Dessert</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.recipeType && (
                            <p className="text-sm text-red-500">{errors.recipeType.message}</p>
                        )}
                    </div>

                    {/* Restrictions alimentaires */}
                    <div className="space-y-2">
                        <Label htmlFor="restrictions">Restrictions alimentaires (optionnel)</Label>
                        <div className="flex gap-2">
                            <Select value={selectedRestriction} onValueChange={setSelectedRestriction} disabled={loadingRestrictions}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder={loadingRestrictions ? "Chargement..." : "Choisir une restriction alimentaire"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {dietaryRestrictions.map((restriction) => (
                                        <SelectItem key={restriction} value={restriction}>
                                            {restriction}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" onClick={addRestriction} variant="outline" size="icon" disabled={loadingRestrictions}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedDietaryRestrictions?.map((restriction, index) => (
                                <Badge key={index} variant="outline" className="text-sm">
                                    {restriction}
                                    <button
                                        type="button"
                                        onClick={() => removeRestriction(restriction)}
                                        className="ml-1 hover:text-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Génération en cours...
                            </>
                        ) : (
                            "Générer ma recette"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}