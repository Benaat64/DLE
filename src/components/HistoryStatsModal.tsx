// src/components/HistoryStatsModal.tsx
import { useEffect, useState } from "react";
import { GameStats, GameResult } from "../core/EnhancedStatsTypes";
import { EnhancedStatsService } from "../core/EnhancedStatsService";
import StatsTab from "./StatsTab";
import HowToPlayTab from "./HowToPlayTab";

export interface HistoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsService: EnhancedStatsService;
  gameResult?: GameResult | null;
  todaysPlayerName?: string;
  leagueId: string; // ID de la ligue actuelle ou "all" pour toutes les ligues
  isGlobalStats?: boolean; // Afficher les statistiques globales ou seulement pour la ligue actuelle
}

const HistoryStatsModal = ({
  isOpen,
  onClose,
  statsService,
  gameResult,
  todaysPlayerName,
  leagueId,
  isGlobalStats = false,
}: HistoryStatsModalProps) => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "howToPlay">("stats");

  // Charger les statistiques lors de l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      // Charger les statistiques appropriées (globales ou pour une ligue)
      const currentStats = isGlobalStats
        ? statsService.getStats()
        : statsService.getStatsForLeague(leagueId);

      setStats(currentStats);
    }
  }, [isOpen, statsService, leagueId, isGlobalStats]);

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md mx-4 overflow-auto max-h-[90vh] shadow-xl relative">
        {/* Grande flèche de retour en haut à gauche */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white hover:text-gray-300 transition-colors z-10 text-2xl"
          aria-label="Back"
        >
          ←
        </button>

        <div className="p-4 pt-12 sm:p-6 sm:pt-14">
          {/* En-tête avec onglets */}
          <div className="flex justify-center mb-6 sm:mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("howToPlay")}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base text-white ${
                activeTab === "howToPlay"
                  ? "border-b-2 border-white"
                  : "opacity-70"
              }`}
            >
              HOW TO PLAY
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base text-white ${
                activeTab === "stats" ? "border-b-2 border-white" : "opacity-70"
              }`}
            >
              MY STATS
            </button>
          </div>

          {/* Contenu de l'onglet actif */}
          {activeTab === "stats" ? (
            <StatsTab stats={stats} statsService={statsService} gameResult={gameResult} todaysPlayerName={todaysPlayerName} leagueId={leagueId} isGlobalStats={isGlobalStats} />
          ) : (
            <HowToPlayTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryStatsModal;
