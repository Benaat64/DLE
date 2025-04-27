// src/core/EnhancedStatsService.ts
import {
  GameStats,
  StatsConfig,
  GameResult,
  GameHistoryEntry,
  // GuessResult est utilisé implicitement via GameHistoryEntry.guessResults
} from "./EnhancedStatsTypes";

export class EnhancedStatsService {
  private config: StatsConfig;
  private storageKey: string;
  private readonly MAX_HISTORY_SIZE = 100; // Augmenté pour garder plus d'historique

  constructor(config: StatsConfig) {
    this.config = config;
    // Créer une clé unique pour ce jeu
    this.storageKey = `game_stats_${config.gameId}`;
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

  // Récupérer les statistiques pour une ligue spécifique
  public getStatsForLeague(leagueId: string): GameStats {
    const allStats = this.getStats();

    // Si on demande toutes les ligues, retourner toutes les statistiques
    if (leagueId === "all") {
      return allStats;
    }

    // Filtrer l'historique des parties pour cette ligue spécifique
    const leagueHistory = allStats.gameHistory.filter((game) => {
      const idMatch = game.id.match(/game_\d{4}-\d{2}-\d{2}_(.+)/);
      return idMatch && idMatch[1] === leagueId;
    });

    // Calculer les statistiques spécifiques à cette ligue
    const gamesPlayed = leagueHistory.length;
    const gamesWon = leagueHistory.filter((game) => game.won).length;

    // Calculer les streaks pour cette ligue
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Trier par date pour calculer les streaks correctement (du plus récent au plus ancien)
    const sortedHistory = [...leagueHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculer le streak actuel et le streak maximum
    for (const game of sortedHistory) {
      if (game.won) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    currentStreak = tempStreak;

    // Calculer la distribution des essais pour cette ligue
    const guessDistribution = Array(this.config.maxAttempts).fill(0);
    leagueHistory.forEach((game) => {
      if (
        game.won &&
        game.attemptsUsed > 0 &&
        game.attemptsUsed <= this.config.maxAttempts
      ) {
        guessDistribution[game.attemptsUsed - 1]++;
      }
    });

    return {
      gamesPlayed,
      gamesWon,
      currentStreak,
      maxStreak,
      guessDistribution,
      lastPlayed: sortedHistory.length > 0 ? sortedHistory[0].date : "",
      gameHistory: leagueHistory,
    };
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
    const today = new Date().toISOString().split("T")[0];
    const stats = this.getStats();

    // Générer un ID unique pour cette partie
    const gameId = `game_${today}_${result.leagueId}`;

    // Vérifier si cette partie a déjà été enregistrée
    const existingEntryIndex = stats.gameHistory.findIndex(
      (entry) => entry.id === gameId
    );

    // Si déjà enregistrée, ne rien faire
    if (existingEntryIndex !== -1) {
      return;
    }

    // Mettre à jour les statistiques globales
    stats.gamesPlayed += 1;
    stats.lastPlayed = today;

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

    // S'assurer que les résultats de devinette sont dans l'ordre chronologique
    // (du premier essai au dernier)
    const guessResults = [...result.guessResults];

    // Créer une entrée d'historique
    const historyEntry: GameHistoryEntry = {
      id: gameId,
      date: today,
      won: result.won,
      attemptsUsed: result.attemptsUsed,
      guessResults: guessResults,
      leagueId: result.leagueId,
      playerName: result.playerName,
    };

    // Ajouter en début de liste et limiter la taille
    stats.gameHistory.unshift(historyEntry);
    if (stats.gameHistory.length > this.MAX_HISTORY_SIZE) {
      stats.gameHistory = stats.gameHistory.slice(0, this.MAX_HISTORY_SIZE);
    }

    this.saveStats(stats);
  }

  // Calculer le taux de victoire
  public getWinRate(): number {
    const stats = this.getStats();
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  // Calculer le taux de victoire pour une ligue spécifique
  public getWinRateForLeague(leagueId: string): number {
    const stats = this.getStatsForLeague(leagueId);
    if (stats.gamesPlayed === 0) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }

  // Obtenir la valeur maximale dans la distribution des essais (pour le graphique)
  public getMaxGuessDistributionValue(): number {
    const stats = this.getStats();
    return Math.max(...stats.guessDistribution, 1); // Au moins 1 pour éviter div par 0
  }

  // Obtenir la valeur maximale dans la distribution des essais pour une ligue spécifique
  public getMaxGuessDistributionValueForLeague(leagueId: string): number {
    const stats = this.getStatsForLeague(leagueId);
    return Math.max(...stats.guessDistribution, 1); // Au moins 1 pour éviter div par 0
  }

  // Récupérer uniquement l'historique des parties
  public getGameHistory(): GameHistoryEntry[] {
    return this.getStats().gameHistory;
  }

  // Récupérer l'historique des parties pour une ligue spécifique
  public getGameHistoryForLeague(leagueId: string): GameHistoryEntry[] {
    if (leagueId === "all") {
      return this.getGameHistory();
    }

    return this.getGameHistory().filter((game) => {
      const idMatch = game.id.match(/game_\d{4}-\d{2}-\d{2}_(.+)/);
      return idMatch && idMatch[1] === leagueId;
    });
  }

  // Vérifier si une partie a déjà été jouée aujourd'hui pour une ligue spécifique
  public hasPlayedToday(leagueId: string): boolean {
    const today = new Date().toISOString().split("T")[0];
    const gameId = `game_${today}_${leagueId}`;
    const stats = this.getStats();

    return stats.gameHistory.some((game) => game.id === gameId);
  }
}
