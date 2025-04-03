// src/core/EnhancedStatsTypes.ts
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // Index represents number of guesses
  lastPlayed: string; // ISO date string
  gameHistory: GameHistoryEntry[]; // Historique des parties
}

export interface GameHistoryEntry {
  id: string; // Identifiant unique de la partie (ex: "Counter-Strike #997")
  date: string; // Date de la partie (ISO string)
  guessResults: GuessResult[]; // Résultats des tentatives
  won: boolean; // Si la partie a été gagnée
  attemptsUsed: number; // Nombre d'essais utilisés
}

export type GuessResult = "correct" | "close" | "incorrect";

export interface StatsConfig {
  gameId: string; // Identifiant unique pour chaque jeu (ex: "lol", "cs", etc.)
  maxAttempts: number; // Nombre maximum d'essais autorisés
  leagueId?: string; // Identifiant de la ligue (optionnel, pour les jeux avec plusieurs ligues)
}

export interface GameResult {
  won: boolean;
  attemptsUsed: number;
  guessResults?: GuessResult[]; // Résultats optionnels des tentatives
}
