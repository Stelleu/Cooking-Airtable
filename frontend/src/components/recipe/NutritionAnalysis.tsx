"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Zap } from "lucide-react";

interface NutritionData {
    caloriesPerServing: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
}

interface NutritionAnalysisProps {
    nutrition: NutritionData;
}

export function NutritionAnalysis({ nutrition }: NutritionAnalysisProps) {
    const totalMacros = nutrition.proteins + nutrition.carbohydrates + nutrition.fats;
    const proteinPercentage = (nutrition.proteins / totalMacros) * 100;
    const carbsPercentage = (nutrition.carbohydrates / totalMacros) * 100;
    const fatsPercentage = (nutrition.fats / totalMacros) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Analyse Nutritionnelle
                </CardTitle>
                <CardDescription>Par portion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Calories */}
                <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="h-6 w-6 text-orange-500" />
                        <span className="text-2xl font-bold">{nutrition.caloriesPerServing}</span>
                        <span className="text-sm text-muted-foreground">kcal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Calories par portion</p>
                </div>

                <Separator />

                {/* Macronutriments */}
                <div className="space-y-4">
                    <h4 className="font-medium">Macronutriments</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Protéines</span>
                            <span className="text-sm font-medium">{nutrition.proteins}g</span>
                        </div>
                        <Progress value={proteinPercentage} className="h-2" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm">Glucides</span>
                            <span className="text-sm font-medium">{nutrition.carbohydrates}g</span>
                        </div>
                        <Progress value={carbsPercentage} className="h-2" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm">Lipides</span>
                            <span className="text-sm font-medium">{nutrition.fats}g</span>
                        </div>
                        <Progress value={fatsPercentage} className="h-2" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm">Fibres</span>
                            <span className="text-sm font-medium">{nutrition.fiber}g</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Vitamines */}
                {Object.keys(nutrition.vitamins).length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">Vitamines principales</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(nutrition.vitamins).map(([vitamin, amount]) => (
                                <Badge key={vitamin} variant="outline" className="text-xs">
                                    {vitamin}: {amount}mg
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Minéraux */}
                {Object.keys(nutrition.minerals).length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium">Minéraux principaux</h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(nutrition.minerals).map(([mineral, amount]) => (
                                <Badge key={mineral} variant="outline" className="text-xs">
                                    {mineral}: {amount}mg
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
