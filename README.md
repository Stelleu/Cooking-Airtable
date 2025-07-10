# Générateur et gestionnaire de recettes personnalisées avec analyse nutritionnelle

## Présentation

Ce projet permet à un internaute de :
- Visualiser la liste des recettes créées
- Visualiser le détail d’une recette et son analyse nutritionnelle (calories, protéines, glucides, lipides, vitamines, minéraux)
- Rechercher une recette par nom, ingrédient ou type de plat
- Créer une nouvelle recette en renseignant :
  - les ingrédients
  - le nombre de personnes
  - les intolérances alimentaires

L’application utilise **Airtable** comme base de données, **Nest.js** pour le backend, **Next.js** et **shadcn/ui** pour le frontend, et un modèle d’intelligence artificielle (Groq) pour la génération et l’analyse nutritionnelle des recettes.

---

## Technologies utilisées
- **Backend** : [Nest.js](https://nestjs.com/) (Node.js, Typescript)
- **Frontend** : [Next.js](https://nextjs.org/) (React, Typescript, app router)
- **UI** : [shadcn/ui](https://ui.shadcn.com/) (design moderne, accessible)
- **Base de données** : [Airtable](https://airtable.com/)
- **IA** : [Groq](https://groq.com/) (API compatible OpenAI)

---

## Installation & Lancement

### 1. Cloner le repo
```bash
git clone <lien-du-repo>
cd Cooking-Airtable
```

### 2. Configurer les variables d’environnement

#### Backend (`backend/.env`)
```
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
OPENAI_API_KEY=...
CORS_ORIGIN=http://localhost:3001
PORT=3001
```

#### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Installer les dépendances
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Lancer le backend
```bash
cd backend
npm run start:dev
```

### 5. Lancer le frontend
```bash
cd frontend
npm run dev
```

---

## Utilisation

- Accéder à l’interface sur [http://localhost:3001](http://localhost:3001)
- Visualiser, rechercher, créer et consulter les recettes et leur analyse nutritionnelle

---

## Accès Airtable
- Un accès partagé à la base Airtable doit être donné à : **yoann.coualan@gmail.com**

---

## Membres du groupe
- Alexandre ALLARD
- Victor Grandin
- Estelle NKUMBA (5IW2)

---

## Structure du projet

```
Cooking-Airtable/
  backend/   # API Nest.js (src/, modules, services, etc.)
  frontend/  # Frontend Next.js (src/app, composants, etc.)
```

---

## Fonctionnalités principales
- Liste des recettes
- Détail d’une recette (avec analyse nutritionnelle)
- Recherche par nom, ingrédient, type
- Création de recette personnalisée (avec IA)

---

## Contraintes respectées
- **Airtable** pour la base de données
- **Javascript/Typescript** pour l’interaction avec Airtable
- **Modèle IA** pour la génération/analyse nutritionnelle
- **Code soigné** (front & back)

---

## Présentation orale
- Présentation du projet
- Difficultés rencontrées et solutions
- Perspectives d’amélioration
- Démonstration d’un morceau de code intéressant

---

Il est possible pour un internaute de :

visualiser la liste des recettes précédemment créées,
visualiser le détail d’une recette et son analyse nutritionnelle (calories, protéines, glucides, lipides, vitamines, minéraux),
rechercher une recette par nom, ingrédient ou type de plat,
demander la création d’une nouvelle recette en renseignant :
les ingrédients,
le nombre de personnes,
les intolérances alimentaires.

# Technologies utilisées
Airtable, Javascript.
Vous devez utiliser un modèle d’intelligence artificielle pour l’analyse nutritionnelle et la génération de recettes.
