"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChefHat, Menu, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Mes Recettes", href: "/recipes" },
    { name: "Créer", href: "/recipes/create" },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <ChefHat className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">Recipe Generator</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link href="/recipes">
                            <Button variant="ghost" size="sm">
                                <Search className="h-4 w-4 mr-2" />
                                Explorer
                            </Button>
                        </Link>
                        <Link href="/recipes/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px]">
                            <div className="flex flex-col space-y-4 mt-6">
                                <Link href="/" className="flex items-center space-x-2 mb-6">
                                    <ChefHat className="h-6 w-6 text-primary" />
                                    <span className="text-lg font-bold">Recipe Generator</span>
                                </Link>

                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-sm font-medium py-2 px-3 rounded-md transition-colors",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-primary hover:bg-muted"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                <div className="border-t pt-4 space-y-2">
                                    <Link href="/recipes" onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Search className="h-4 w-4 mr-2" />
                                            Explorer les recettes
                                        </Button>
                                    </Link>
                                    <Link href="/recipes/create" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full justify-start">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Créer une recette
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}