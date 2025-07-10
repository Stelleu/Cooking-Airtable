import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Brain, Activity, Search, Plus, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ChefHat className="h-20 w-20 text-primary" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Recipe Generator
            <span className="text-primary block">Powered by AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Créez des recettes personnalisées en quelques clics ! Notre IA génère des recettes uniques
            basées sur vos ingrédients et contraintes alimentaires, avec analyse nutritionnelle complète.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recipes/create">
              <Button size="lg" className="text-lg px-8">
                <Plus className="mr-2 h-5 w-5" />
                Créer une recette
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Explorer les recettes
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>IA Culinaire Avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Notre intelligence artificielle crée des recettes uniques en analysant vos ingrédients
                et en respectant vos contraintes alimentaires.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Analyse Nutritionnelle</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Obtenez une analyse nutritionnelle détaillée pour chaque recette : calories,
                macronutriments, vitamines et minéraux.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Recherche Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Trouvez facilement vos recettes par nom, ingrédient, type de plat ou
                restriction alimentaire grâce à notre système de recherche avancé.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* Statistics */}
        <section className="bg-muted/50 rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Recettes possibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-sm text-muted-foreground">Analyses nutritionnelles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Personnalisé</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Disponible</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12 bg-primary/5 rounded-lg">
          <h2 className="text-3xl font-bold">Prêt à créer votre première recette ?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Il suffit de quelques ingrédients pour commencer. Notre IA se charge du reste !
          </p>
          <Link href="/recipes/create">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="mr-2 h-5 w-5" />
              Commencer maintenant
            </Button>
          </Link>
        </section>
      </div>
  );
}