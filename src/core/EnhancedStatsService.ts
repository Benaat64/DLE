// src/core/EnhancedStatsService.ts
import {
  GameStats,
  StatsConfig,
  GameResult,
  GameHistoryEntry,
  GuessResult,
} from "./EnhancedStatsTypes";

export class EnhancedStatsService {
  private config: StatsConfig;
  private storageKey: string;
  private readonly MAX_HISTORY_SIZE = 10; // Nombre maximum de parties à conserver dans l'historique

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
      gameHistory: [],
    };
  }

  // Récupérer les statistiques depuis le localStorage
  public getStats(): GameStats {
    try {
      const storedStats = localStorage.getItem(this.storageKey);
      if (storedStats) {
        const stats = JSON.parse(storedStats);

        // Assurer la compatibilité avec l'ancien format (sans gameHistory)
        if (!stats.gameHistory) {
          stats.gameHistory = [];
        }

        return stats;
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

  // Générer un ID pour la partie actuelle (ex: "Counter-Strike #997")
  public generateGameId(): string {
    const stats = this.getStats();
    const gameNumber = stats.gamesPlayed + 1;
    const gameName = this.config.gameId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");

    return `${gameName} #${gameNumber}`;
  }

  // Enregistrer le résultat d'une partie
  public recordGameResult(result: GameResult): void {
    const currentDate = new Date().toISOString();
    const todayDate = currentDate.split("T")[0];
    const stats = this.getStats();

    // Vérifier si le jeu a déjà été joué aujourd'hui
    if (stats.lastPlayed === todayDate) {
      return; // Ne pas enregistrer plusieurs fois le même jour
    }

    // Mettre à jour les stats
    stats.gamesPlayed += 1;
    stats.lastPlayed = todayDate;

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

    // Ajouter cette partie à l'historique
    const guessResults = result.guessResults || [];
    const gameId = this.generateGameId();

    const historyEntry: GameHistoryEntry = {
      id: gameId,
      date: currentDate,
      guessResults,
      won: result.won,
      attemptsUsed: result.attemptsUsed,
    };

    // Ajouter en début de liste et limiter la taille
    stats.gameHistory.unshift(historyEntry);
    stats.gameHistory = stats.gameHistory.slice(0, this.MAX_HISTORY_SIZE);

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

  // Récupérer l'historique des parties
  public getGameHistory(): GameHistoryEntry[] {
    const stats = this.getStats();
    return stats.gameHistory;
  }
}
