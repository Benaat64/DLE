# DLE — Devine le joueur League of Legends

Jeu quotidien où l'on retrouve un joueur professionnel de League of Legends à partir de ses caractéristiques. Le projet comprend une application web React, une API Express pour les informations complémentaires des joueurs et un prototype mobile Expo.

## Lancer le projet web

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Pour lancer l'API locale :

```bash
cd lol-backend
npm install
node server.js
```

`npm run build` vérifie TypeScript et construit l'application web. L'URL du backend consommé par le frontend est actuellement définie dans `src/games/lol/api.ts` ; le lancement de l'API locale ne change pas cette URL automatiquement.

## Organisation du code

- `src/core/` : moteur de jeu, recherche, sélection des joueurs, statistiques et sauvegarde locale.
- `src/games/lol/` : adaptation des données League of Legends et composants propres à ce jeu.
- `src/components/` : composants partagés de l'interface web.
- `lol-backend/` : route API et récupération des informations complémentaires des joueurs.
- `mobile/` : prototype Expo distinct de l'application web.

L'interface web utilise le catalogue Riot Esports pour les équipes et joueurs. L'API Express recherche ensuite les détails, notamment pays et date de naissance, dans Leaguepedia. La sélection LEC du split été 2026 est une liste tenue à jour dans `src/games/lol/api.ts`, car le catalogue Riot contient aussi des effectifs historiques. Cette liste devra être actualisée pour un nouveau split.

## État et limites

- Les données d'âge et de pays peuvent manquer lorsque Leaguepedia limite les requêtes. L'interface affiche alors `N/A` ; la réponse positive est mise en cache côté serveur pendant 24 heures.
- Le catalogue des joueurs n'est pas synchronisé automatiquement avec les changements de roster du split LEC.
- Le dossier `mobile/` est un prototype avec deux joueurs fictifs et une partie de démonstration. Il ne représente pas le jeu web complet.
- Le contrôle ESLint global relève encore des erreurs dans du code existant ; la construction web passe avec `npm run build`.
