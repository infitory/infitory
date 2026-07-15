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

### ✅ Étape 3 — Simulation & statistiques (fait)
- Simulation des matchs : vainqueur tiré selon un **rating Elo caché** par équipe (mis à jour après chaque match), scores adaptés à la discipline (best-of pour les esports/volley, buts pour le football avec nuls possibles en round robin, gros scores pour le basket)
- Contrôles : simuler **1 match**, **la ronde en cours**, **tout le tournoi**, ou un match précis via son bouton ▶
- **Rondes suisses** suivantes générées automatiquement d'après le classement (appariement par voisinage de score, évitement des re-matchs, rotation des exempts)
- **Statistiques équipes** : matchs, V/N/D, points, score pour/contre, rating Elo
- **Statistiques joueurs** : matchs, victoires/défaites, score (buts/points ou indice de perf) et **MVP** par match gagné
- Fin de tournoi automatique : **podium** (champion + finaliste), champion affiché sur la carte du tournoi

## Format CSV

```csv
equipe,joueur,role
Crimson Wolves,Lucas "Blaze",Top
Crimson Wolves,Emma "Frost",Jungle
Shadow Dragons,Hugo "Nova",Mid
```

Une ligne par joueur ; la colonne `role` est optionnelle. Séparateurs acceptés : `,` ou `;`.
