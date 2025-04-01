// src/games/lol/playerUtils.ts
import { GameData } from "../../components/GameTable/types";

// Classe pour faciliter la recherche et la gestion des joueurs
export class PlayerSearchHelper {
  private players: GameData[];
  private searchIndex: Map<string, GameData>;

  constructor(players: GameData[]) {
    this.players = players;
    this.searchIndex = new Map();
    this.buildSearchIndex();
  }

  // Construire un index de recherche pour une recherche rapide
  private buildSearchIndex(): void {
    this.players.forEach((player) => {
      // Indexer le nom complet
      this.searchIndex.set(player.name.toLowerCase(), player);

      // Extraire et indexer le surnom (entre guillemets)
      const nicknameMatch = player.name.match(/"([^"]+)"/);
      if (nicknameMatch && nicknameMatch[1]) {
        this.searchIndex.set(nicknameMatch[1].toLowerCase(), player);
      }

      // Indexer les parties du nom (prénom, nom, surnom) séparément
      const nameParts = player.name
        .replace(/"/g, "") // Enlever les guillemets
        .split(" ")
        .filter((part) => part.length > 2); // Ignorer les parties trop courtes

      nameParts.forEach((part) => {
        this.searchIndex.set(part.toLowerCase(), player);
      });
    });
  }

  // Rechercher un joueur par son nom (complet ou partiel)
  public findPlayer(searchTerm: string): GameData | null {
    const term = searchTerm.toLowerCase().trim();

    // Recherche exacte d'abord
    if (this.searchIndex.has(term)) {
      return this.searchIndex.get(term) || null;
    }

    // Recherche partielle ensuite
    for (const [key, player] of this.searchIndex.entries()) {
      if (key.includes(term) || term.includes(key)) {
        return player;
      }
    }

    return null;
  }

  // Obtenir des suggestions de noms basées sur un terme de recherche
  public getSuggestions(
    searchTerm: string,
    maxResults: number = 5,
    excludeIds: string[] = []
  ): string[] {
    const term = searchTerm.toLowerCase().trim();
    if (term.length < 2) return [];

    const suggestions = new Set<string>();
    const matches: { player: GameData; relevance: number }[] = [];

    // Évaluer la pertinence de chaque joueur
    this.players
      .filter((player) => !excludeIds.includes(player.id))
      .forEach((player) => {
        const name = player.name.toLowerCase();
        let relevance = 0;

        // Nom exact a la plus haute pertinence
        if (name === term) {
          relevance = 100;
        }
        // Surnom exact a une forte pertinence
        else if (name.includes(`"${term}"`)) {
          relevance = 90;
        }
        // Commence par le terme de recherche
        else if (name.startsWith(term)) {
          relevance = 80;
        }
        // Contient le terme exact
        else if (name.includes(` ${term} `)) {
          relevance = 70;
        }
        // Contient le terme
        else if (name.includes(term)) {
          relevance = 60;
        }
        // Le terme contient une partie du nom
        else if (term.includes(name)) {
          relevance = 50;
        }
        // Correspondance partielle
        else {
          const nameParts = name.split(" ");
          for (const part of nameParts) {
            if (part.startsWith(term) || term.startsWith(part)) {
              relevance = 40;
              break;
            }
          }
        }

        if (relevance > 0) {
          matches.push({ player, relevance });
        }
      });

    // Trier par pertinence et limiter au nombre maximal de résultats
    matches
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
      .forEach((match) => {
        suggestions.add(match.player.name);
      });

    return Array.from(suggestions);
  }

  // Obtenir tous les joueurs
  public getAllPlayers(): GameData[] {
    return [...this.players];
  }

  // Obtenir un joueur aléatoire
  public getRandomPlayer(): GameData {
    const randomIndex = Math.floor(Math.random() * this.players.length);
    return this.players[randomIndex];
  }
}
