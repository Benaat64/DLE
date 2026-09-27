# DLE - Devine le joueur LoL

DLE est un petit jeu inspiré de Wordle dans lequel il faut retrouver un joueur professionnel de League of Legends.

J'ai commencé ce projet il y a environ deux ans pour progresser en React et apprendre à utiliser plusieurs API dans une même application. J'y ai travaillé pendant environ un mois, puis je l'ai mis de côté. Je le reprends aujourd'hui pour le remettre à jour et améliorer sa structure.

## Comment fonctionne le jeu ?

À chaque proposition, le jeu compare le joueur choisi avec le joueur mystère :

- son équipe ;
- son rôle ;
- sa ligue ;
- son pays ;
- son âge.

La partie du jour et les statistiques sont sauvegardées dans le navigateur.

## Les données des joueurs

J'utilise deux sources différentes :

- l'API Riot Esports pour récupérer les joueurs, les équipes, les rôles et les ligues ;
- Leaguepedia pour compléter avec l'âge et la nationalité.

Les deux API n'ont pas d'identifiant commun. Je les relie donc avec le pseudo du joueur :

```text
Riot : summonerName → Leaguepedia : Player
```

Comme plusieurs joueurs peuvent avoir le même pseudo, je vérifie aussi l'équipe et le rôle pour sélectionner la bonne fiche.

## Problème actuel

Pendant le développement initial, cette méthode fonctionnait correctement. Aujourd'hui, Leaguepedia limite beaucoup plus souvent les requêtes et renvoie `ratelimited`. Je n'ai pas trouvé de quota officiel permettant de comparer précisément l'ancienne et la nouvelle limite.

L'API Riot fonctionne toujours, mais l'âge et la nationalité peuvent donc afficher `N/A` ou `Inconnu`.

J'ai ajouté un cache de 24 heures, évité les requêtes identiques et amélioré la recherche des joueurs ayant le même pseudo. Plus tard, la meilleure solution serait d'enregistrer les joueurs actifs dans une petite base de données et de la mettre à jour automatiquement.

## Technologies

- React et TypeScript ;
- Tailwind CSS ;
- Node.js et Express ;
- API Riot Esports et Leaguepedia.

## Lancer le projet

```bash
npm install
npm run dev
```

Pour lancer le backend :

```bash
cd lol-backend
npm install
node server.js
```

Le dossier `mobile` contient aussi un prototype Expo, mais la version principale du projet est la version web.
