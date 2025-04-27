import { GameData, PlayerSelectionStrategy } from "./types";

// Stratégie de sélection aléatoire (mode développement)
export class RandomPlayerStrategy<T extends GameData>
  implements PlayerSelectionStrategy<T>
{
  private leagues?: string[];

  constructor(leagues?: string[], _leagueId: string = "all") {
    this.leagues = leagues;
    // _leagueId est accepté pour compatibilité mais n'est pas utilisé
  }

  selectPlayer(players: T[]): T | null {
    if (!players || players.length === 0) return null;

    // Filtrer par ligues si spécifié
    let filteredPlayers = players;
    if (this.leagues && this.leagues.length > 0) {
      filteredPlayers = players.filter(
        (player) => player.league && this.leagues?.includes(player.league)
      );
    }

    if (filteredPlayers.length === 0) return null;

    // Générer un index aléatoire
    const randomIndex = Math.floor(Math.random() * filteredPlayers.length);
    return filteredPlayers[randomIndex];
  }
}

// Stratégie de sélection basée sur la date (mode production)
export class DailyPlayerStrategy<T extends GameData>
  implements PlayerSelectionStrategy<T>
{
  private leagues?: string[];
  private leagueId: string;

  constructor(leagues?: string[], leagueId: string = "all") {
    this.leagues = leagues;
    this.leagueId = leagueId;
  }

  // Génère une seed basée sur la date du jour et la ligue
  private getTodaySeed(): number {
    const now = new Date();
    const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

    // Ajouter la ligue à la seed pour avoir un joueur différent par ligue
    const combinedString = `${dateString}${this.leagueId}`;

    // Convertir la chaîne en nombre pour la seed
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
      hash = (hash << 5) - hash + combinedString.charCodeAt(i);
      hash |= 0; // Convertir en entier 32 bits
    }

    return Math.abs(hash);
  }

  selectPlayer(players: T[]): T | null {
    if (!players || players.length === 0) return null;

    // Filtrer par ligues si spécifié
    let filteredPlayers = players;
    if (this.leagues && this.leagues.length > 0) {
      filteredPlayers = players.filter(
        (player) => player.league && this.leagues?.includes(player.league)
      );
    }

    if (filteredPlayers.length === 0) return null;

    // Utiliser la date + ligue comme seed
    const seed = this.getTodaySeed();
    const index = seed % filteredPlayers.length;

    return filteredPlayers[index];
  }
}

// Factory pour créer la stratégie appropriée selon l'environnement
export const createPlayerSelectionStrategy = <T extends GameData>(
  isDevelopment: boolean = false,
  leagues?: string[],
  leagueId: string = "all"
): PlayerSelectionStrategy<T> => {
  // Traitement spécial pour la ligue LEC
  if (leagueId.toLowerCase() === "lec") {
    // Forcer à utiliser uniquement les joueurs de la LEC
    // en excluant explicitement les joueurs EMEA
    return isDevelopment
      ? new RandomPlayerStrategy<T>(["LEC"], "lec")
      : new DailyPlayerStrategy<T>(["LEC"], "lec");
  }

  // Pour les autres ligues, comportement normal
  return isDevelopment
    ? new RandomPlayerStrategy<T>(leagues, leagueId)
    : new DailyPlayerStrategy<T>(leagues, leagueId);
};
