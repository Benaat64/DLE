// src/core/useGameStats.ts
import { useState, useCallback, useEffect } from "react";
import { GameResult, StatsConfig } from "./types";
import { StatsService } from "./StatsService";

export const useGameStats = (config: StatsConfig) => {
  const [isStatsModalOpen, setStatsModalOpen] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  // Assurez-vous que la création du service se fait correctement
  const [statsService] = useState(() => new StatsService(config));

  // Vérifier s'il s'agit d'un nouveau jour
  useEffect(() => {
    const stats = statsService.getStats();
    const today = new Date().toISOString().split("T")[0];

    // Si le jeu a déjà été joué aujourd'hui, on peut charger le résultat précédent
    if (stats.lastPlayed === today) {
      // Logique pour restaurer l'état du jeu si nécessaire
    }
  }, [statsService]);

  // Enregistrer le résultat d'une partie
  const recordGameEnd = useCallback(
    (result: GameResult) => {
      setGameResult(result);
      setStatsModalOpen(true);
      // Enregistrer le résultat dans le service de statistiques
      statsService.recordGameResult(result);
    },
    [statsService]
  );

  // Ouvrir la modal de statistiques sans enregistrer de résultat
  const showStats = useCallback(() => {
    setGameResult(null);
    setStatsModalOpen(true);
  }, []);

  // Exposer explicitement le statsService
  return {
    isStatsModalOpen,
    setStatsModalOpen,
    gameResult,
    statsService, // Assurez-vous que cette propriété est exposée
    recordGameEnd,
    showStats,
  };
};
