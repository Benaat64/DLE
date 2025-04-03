// src/core/useEnhancedStats.ts
import { useState, useCallback, useEffect } from "react";
import { StatsConfig, GameResult, GuessResult } from "./EnhancedStatsTypes";
import { EnhancedStatsService } from "./EnhancedStatsService";

export const useEnhancedStats = (config: StatsConfig) => {
  const [isStatsModalOpen, setStatsModalOpen] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  // Créer le service de statistiques
  const [statsService] = useState(() => new EnhancedStatsService(config));

  // Vérifier s'il s'agit d'un nouveau jour
  useEffect(() => {
    const stats = statsService.getStats();
    const today = new Date().toISOString().split("T")[0];

    // Si le jeu a déjà été joué aujourd'hui, on peut restaurer l'état précédent
    if (stats.lastPlayed === today) {
      // Si nécessaire, vous pouvez ajouter une logique pour restaurer l'état du jeu
    }
  }, [statsService]);

  // Enregistrer le résultat d'une partie
  const recordGameEnd = useCallback(
    (won: boolean, attemptsUsed: number, guessResults: GuessResult[] = []) => {
      const result: GameResult = {
        won,
        attemptsUsed,
        guessResults,
      };

      setGameResult(result);
      setStatsModalOpen(true);

      // Enregistrer le résultat
      statsService.recordGameResult(result);
    },
    [statsService]
  );

  // Ouvrir la modal de statistiques sans enregistrer de résultat
  const showStats = useCallback(() => {
    setGameResult(null);
    setStatsModalOpen(true);
  }, []);

  return {
    isStatsModalOpen,
    setStatsModalOpen,
    gameResult,
    statsService,
    recordGameEnd,
    showStats,
  };
};
