<div align="center">

# ☕ DLE

### Devine le joueur professionnel de League of Legends du jour

Un jeu quotidien pour tester sa connaissance de la scène compétitive LoL.

**React · TypeScript · Express · Tailwind CSS**

</div>

## 🎮 Fonctionnalités

- recherche d'un joueur avec suggestions ;
- comparaison de l'équipe, du rôle, de la ligue, du pays et de l'âge ;
- partie quotidienne sauvegardée dans le navigateur ;
- historique et statistiques ;
- filtres par ligue et effectif LEC actuel.

## 🔗 Deux API réunies

Le projet combine deux sources :

- **Riot Esports** : joueurs, équipes, rôles, ligues et images ;
- **Leaguepedia** : date de naissance, nationalité et réseaux sociaux.

Elles ne partagent pas d'identifiant unique. Le backend rapproche donc le pseudo Riot avec le joueur Leaguepedia, puis utilise l'équipe et le rôle pour éviter les homonymes.

```text
Riot.summonerName → Leaguepedia.Player
                     + équipe + rôle
```

## ⚠️ État actuel

Lors de la création du projet, il y a environ deux ans, cette méthode récupérait correctement les âges et nationalités. Aujourd'hui, Leaguepedia renvoie fréquemment `ratelimited`. Les quotas exacts, anciens comme actuels, ne sont pas documentés ici.

Tests réalisés le **24 septembre 2026** :

- ✅ TypeScript et build web réussis ;
- ✅ catalogue Riot accessible ;
- ⚠️ Caps, Faker et Viper renvoient actuellement un âge `N/A` et un pays `Inconnu` ;
- ❌ lint global : 27 erreurs et 3 avertissements, principalement dans le prototype mobile et d'anciens types.

L'application reste utilisable pour les données Riot, mais l'âge et la nationalité ne sont plus fiables. Le jeu affiche `N/A` lorsqu'une information ne peut pas être confirmée.

### Protections présentes

- correspondance vérifiée avec le pseudo, l'équipe et le rôle ;
- gestion explicite des réponses `ratelimited` ;
- regroupement des requêtes identiques ;
- cache serveur de 24 heures ;
- filtrage manuel du roster LEC actuel.

### À améliorer

1. stocker les joueurs actifs dans une base locale persistante ;
2. actualiser les données avec une tâche planifiée ;
3. ajouter une source secondaire et automatiser les changements de roster ;
4. terminer le prototype mobile et corriger le lint historique.

## 🏗️ Structure

```text
src/core/         moteur du jeu et sauvegarde
src/games/lol/    logique et interface League of Legends
src/components/   composants partagés et statistiques
lol-backend/      API Express et accès à Leaguepedia
mobile/           prototype Expo indépendant
```

La logique du jeu, l'accès aux données et les composants d'affichage sont séparés pour faciliter la maintenance.

## 🚀 Installation

```bash
npm install
npm run dev
```

Backend local :

```bash
cd lol-backend
npm install
node server.js
```

Le backend local utilise le port `9000`. Son URL doit être renseignée dans `src/games/lol/api.ts`.

```bash
npm run type-check
npm run build
npm run lint
```

> `npm run lint` signale encore les problèmes listés dans la section **État actuel**.
