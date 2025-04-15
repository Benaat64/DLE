// src/core/useEnhancedGameStats.ts
import { useState, useCallback, useMemo } from "react";
import { EnhancedStatsService } from "./EnhancedStatsService";
import { GameResult, StatsConfig, GuessResult } from "./EnhancedStatsTypes";

export interface UseEnhancedStatsOptions {
  isGlobalStats?: boolean;
}

export const useEnhancedStats = (
  config: StatsConfig,
  options: UseEnhancedStatsOptions = {}
) => {
  const { isGlobalStats = false } = options;
  const [isStatsModalOpen, setStatsModalOpen] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Créer le service de statistiques une seule fois
  const statsService = useMemo(
    () => new EnhancedStatsService(config),
    [config]
  );

  // Enregistrer le résultat de la partie
  const recordGameEnd = useCallback(
    (
      won: boolean,
      attemptsUsed: number,
      guessResults: GuessResult[],
      playerName?: string
    ) => {
      const result: GameResult = {
        won,
        attemptsUsed,
        guessResults,
        playerName,
        leagueId: config.leagueId,
      };

      // Enregistrer le résultat
      statsService.recordGameResult(result);
      setGameResult(result);
    },
    [config.leagueId, statsService]
  );

  // Afficher la modal des statistiques
  const showStats = useCallback(() => {
    setStatsModalOpen(true);
  }, []);

  // Vérifier si une partie a déjà été jouée aujourd'hui pour cette ligue
  const hasPlayedToday = useMemo(() => {
    return statsService.hasPlayedToday(config.leagueId);
  }, [config.leagueId, statsService]);

  return {
    isStatsModalOpen,
    setStatsModalOpen,
    gameResult,
    statsService,
    recordGameEnd,
    showStats,
    hasPlayedToday,
    isGlobalStats,
  };
};
