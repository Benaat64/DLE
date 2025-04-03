// src/core/StatsService.ts
import {
  GameStats,
  StatsConfig,
  GameResult,
  StatsService as IStatsService,
} from "./types";

export class StatsService implements IStatsService {
  private config: StatsConfig;
  private storageKey: string;

  constructor(config: StatsConfig) {
    this.config = config;
    // Créer une clé unique pour ce jeu et cette ligue (si applicable)
    this.storageKey = `game_stats_${config.gameId}${
      config.leagueId ? "_" + config.leagueId : ""
    }`;
  }

  // Initialiser des statistiques vierges
  private getInitialStats(): GameStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: Array(this.config.maxAttempts).fill(0),
      lastPlayed: "",
    };
  }

  // Récupérer les statistiques depuis le localStorage
  public getStats(): GameStats {
    try {
      const storedStats = localStorage.getItem(this.storageKey);
      if (storedStats) {
        return JSON.parse(storedStats);
      }
    } catch (error) {
      console.error("Error reading stats from localStorage", error);
    }

    return this.getInitialStats();
  }

  // Sauvegarder les statistiques dans localStorage
  private saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stats));
    } catch (error) {
      console.error("Error saving stats to localStorage", error);
    }
  }

  // Enregistrer le résultat d'une partie
  public recordGameResult(result: GameResult): void {
    const currentDate = new Date().toISOString().split("T")[0];
    const stats = this.getStats();

    // Vérifier si le jeu a déjà été joué aujourd'hui
    if (stats.lastPlayed === currentDate) {
      return; // Ne pas enregistrer plusieurs fois le même jour
    }

    // Mettre à jour les stats
    stats.gamesPlayed += 1;
    stats.lastPlayed = currentDate;

    if (result.won) {
      stats.gamesWon += 1;
      stats.currentStreak += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

      // Mettre à jour la distribution des essais (index 0-based)
      const attemptsIndex = result.attemptsUsed - 1;
      if (
        attemptsIndex >= 0 &&
        attemptsIndex < stats.guessDistribution.length
      ) {
        stats.guessDistribution[attemptsIndex] += 1;
      }
    } else {
      // Réinitialiser la série en cours
      stats.currentStreak = 0;
    }

    this.saveStats(stats);
  }

  // Calculer le taux de victoire
  public getWinRate(): number {
    const stats = this.getStats();
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  // Obtenir la valeur maximale dans la distribution des essais (pour le graphique)
  public getMaxGuessDistributionValue(): number {
    const stats = this.getStats();
    return Math.max(...stats.guessDistribution, 1); // Au moins 1 pour éviter div par 0
  }
}
