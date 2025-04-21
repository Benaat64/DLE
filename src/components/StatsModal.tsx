// src/components/StatsModal.tsx
import { useEffect, useState } from "react";
import { GameStats, GameResult, StatsConfig } from "../core/types";
import { StatsService } from "../core/StatsService";

export interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StatsConfig;
  statsService: StatsService; // Assurez-vous que cette prop est requise
  gameResult?: GameResult | null;
  todaysPlayerName?: string; // Nom du joueur à deviner aujourd'hui
}

const StatsModal = ({
  isOpen,
  onClose,
  config,
  statsService, // Utiliser cette prop au lieu de créer un nouveau service
  gameResult,
  todaysPlayerName,
}: StatsModalProps) => {
  const [stats, setStats] = useState<GameStats | null>(null);

  // Charger les statistiques lors de l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      // Utiliser le service existant pour obtenir les statistiques
      try {
        const currentStats = statsService.getStats();
        setStats(currentStats);
      } catch (error) {
        console.error("Error loading stats:", error);
        // Initialiser avec des stats vides en cas d'erreur
        setStats({
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          maxStreak: 0,
          guessDistribution: Array(config.maxAttempts).fill(0),
          lastPlayed: "",
        });
      }
    }
  }, [isOpen, statsService, config.maxAttempts]);

  if (!isOpen || !stats) return null;

  const winRate = statsService.getWinRate();
  const maxValue = statsService.getMaxGuessDistributionValue();

  // Formater l'heure pour le prochain jeu (minuit)
  const getNextGameTime = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4 overflow-auto max-h-[90vh] shadow-xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Statistics
            </h2>
            {/* Flèche de retour au lieu du bouton X */}
            <button
              onClick={onClose}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back
            </button>
          </div>

          {gameResult && (
            <div className="mb-4 sm:mb-6 text-center">
              {gameResult.won ? (
                <div className="text-green-400 text-base sm:text-lg font-semibold mb-2">
                  You won in {gameResult.attemptsUsed}{" "}
                  {gameResult.attemptsUsed === 1 ? "try" : "tries"}!
                </div>
              ) : (
                <div className="text-yellow-400 text-base sm:text-lg font-semibold mb-2">
                  Game Over!
                  {todaysPlayerName && (
                    <div>The player was {todaysPlayerName}</div>
                  )}
                </div>
              )}
              <div className="text-gray-300 text-sm">
                Next game in {getNextGameTime()}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <StatBox label="Played" value={stats.gamesPlayed} />
            <StatBox label="Win %" value={`${winRate}%`} />
            <StatBox label="Current Streak" value={stats.currentStreak} />
            <StatBox label="Max Streak" value={stats.maxStreak} />
          </div>

          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              Guess Distribution
            </h3>

            {stats.gamesPlayed === 0 ? (
              <div className="text-gray-400 text-center py-3 sm:py-4">
                No data yet. Play some games!
              </div>
            ) : (
              <div className="space-y-1 sm:space-y-2">
                {stats.guessDistribution.map((count, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-white mr-2 w-4 text-sm sm:text-base">
                      {index + 1}
                    </div>
                    <div className="flex-1 h-6 sm:h-8 flex items-center">
                      <div
                        className={`h-full ${
                          gameResult &&
                          gameResult.won &&
                          gameResult.attemptsUsed === index + 1
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width:
                            count === 0 ? "0%" : `${(count / maxValue) * 100}%`,
                          minWidth: count > 0 ? "10%" : "0%",
                        }}
                      >
                        {count > 0 && (
                          <span className="text-white px-2 text-xs sm:text-sm flex h-full items-center">
                            {count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suppression du bouton Close en bas */}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher une statistique
const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="bg-gray-700 rounded p-2 sm:p-3 text-center">
    <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-300">{label}</div>
  </div>
);

export default StatsModal;
