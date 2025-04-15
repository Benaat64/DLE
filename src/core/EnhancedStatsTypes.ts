// src/core/EnhancedStatsTypes.ts

export type GuessResult = "correct" | "close" | "incorrect";

export interface GameHistoryEntry {
  id: string; // Format: "game_YYYY-MM-DD_leagueId"
  date: string; // Format: "YYYY-MM-DD"
  won: boolean;
  attemptsUsed: number;
  guessResults: GuessResult[];
  playerName?: string; // Nom du joueur à deviner (optionnel)
  leagueId: string; // Identifiant de la ligue
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastPlayed: string; // ISO date string
  gameHistory: GameHistoryEntry[];
}

export interface GameResult {
  won: boolean;
  attemptsUsed: number;
  guessResults: GuessResult[];
  playerName?: string;
  leagueId: string;
}

export interface StatsConfig {
  gameId: string;
  maxAttempts: number;
  leagueId: string;
}
