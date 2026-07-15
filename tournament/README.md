# 🏆 Tournify — Gestionnaire de tournois

Application web (HTML/CSS/JS vanilla, sans build) pour créer et simuler des tournois esports & sports.

## Lancer l'application

Ouvrir `tournament/index.html` dans un navigateur, ou servir le dossier :

```bash
cd tournament && python3 -m http.server 8080
```

Les données sont persistées dans le `localStorage` du navigateur.

## Fonctionnalités

### ✅ Étape 1 — Création de tournois (fait)
- Création de tournois avec disciplines prédéfinies (LoL, CS2, Valorant, Rocket League, football, basket, volley…) ou personnalisées
- Choix du format : élimination simple, élimination double, round robin, système suisse
- Génération automatique d'équipes et de joueurs (noms + rôles aléatoires adaptés à la discipline)
- Import d'équipes/joueurs depuis un fichier CSV (`equipe,joueur[,role]`) avec exemple téléchargeable
- Persistance localStorage, liste et détail des tournois

### 🚧 Étape 2 — Brackets & rondes (à venir)
- Génération du bracket / calendrier selon le format
- Affichage visuel du bracket, des rondes et du classement

### 🚧 Étape 3 — Simulation & statistiques (à venir)
- Simulation des matchs (basée sur un rating caché par équipe)
- Statistiques par équipe (V/D, points, différentiel) et par joueur (matchs, score, MVP)

## Format CSV

```csv
equipe,joueur,role
Crimson Wolves,Lucas "Blaze",Top
Crimson Wolves,Emma "Frost",Jungle
Shadow Dragons,Hugo "Nova",Mid
```

Une ligne par joueur ; la colonne `role` est optionnelle. Séparateurs acceptés : `,` ou `;`.
