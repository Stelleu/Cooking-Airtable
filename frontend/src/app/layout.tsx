import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/Header";


export const metadata: Metadata = {
    title: "Recipe Generator - IA Culinaire",
    description: "Générateur de recettes personnalisées avec analyse nutritionnelle par IA",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <QueryProvider>
          <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-4 py-8">
                  {children}
              </main>
          </div>
          <Toaster />
      </QueryProvider>
      </body>
    </html>
  );
}
