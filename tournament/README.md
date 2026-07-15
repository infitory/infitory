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

### ✅ Étape 2 — Brackets & rondes (fait)
- Démarrage du tournoi : génération du bracket / calendrier selon le format
  - **Élimination simple** : bracket avec byes automatiques si le nombre d'équipes n'est pas une puissance de 2
  - **Élimination double** : winner bracket, loser bracket et grande finale
  - **Round robin** : calendrier complet par la méthode du cercle (gestion des équipes exemptées si nombre impair)
  - **Système suisse** : ronde 1 aléatoire, rondes suivantes générées d'après le classement (à l'étape 3)
- Affichage visuel : bracket horizontal défilable, blocs de rondes, onglets (Bracket/Rondes, Classement, Équipes)
- Classement (round robin/suisse) : points (V=3, N=1), différentiel, tri automatique
- Propagation automatique des vainqueurs dans le bracket + résolution des exempts
- Réinitialisation d'un tournoi (retour en préparation)

### 🚧 Étape 3 — Simulation & statistiques (à venir)
- Simulation des matchs (basée sur un rating caché par équipe), match par match ou tournoi complet
- Génération des rondes suisses suivantes d'après les résultats
- Statistiques par équipe (V/D, points, différentiel) et par joueur (matchs, score, MVP)
- Podium / vainqueur du tournoi

## Format CSV

```csv
equipe,joueur,role
Crimson Wolves,Lucas "Blaze",Top
Crimson Wolves,Emma "Frost",Jungle
Shadow Dragons,Hugo "Nova",Mid
```

Une ligne par joueur ; la colonne `role` est optionnelle. Séparateurs acceptés : `,` ou `;`.
