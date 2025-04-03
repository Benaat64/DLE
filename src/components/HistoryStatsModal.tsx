// src/components/HistoryStatsModal.tsx
import React, { useEffect, useState } from "react";
import {
  GameStats,
  GameResult,
  GuessResult,
  GameHistoryEntry,
} from "../core/EnhancedStatsTypes";
import { EnhancedStatsService } from "../core/EnhancedStatsService";

export interface HistoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsService: EnhancedStatsService;
  gameResult?: GameResult | null;
  todaysPlayerName?: string;
}

const HistoryStatsModal: React.FC<HistoryStatsModalProps> = ({
  isOpen,
  onClose,
  statsService,
  gameResult,
  todaysPlayerName,
}) => {
  const [stats, setStats] = useState<GameStats | null>(null);

  // Charger les statistiques lors de l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      // Charger les statistiques
      const currentStats = statsService.getStats();
      setStats(currentStats);
    }
  }, [isOpen, statsService]);

  if (!isOpen || !stats) return null;

  const winRate = statsService.getWinRate();
  const maxValue = statsService.getMaxGuessDistributionValue();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Your statistics
          </h2>

          {/* Résultat de la partie actuelle si disponible */}
          {gameResult && (
            <div className="mb-6 text-center">
              {gameResult.won ? (
                <div className="text-green-400 text-lg font-semibold mb-2">
                  You won in {gameResult.attemptsUsed}{" "}
                  {gameResult.attemptsUsed === 1 ? "try" : "tries"}!
                </div>
              ) : (
                <div className="text-yellow-400 text-lg font-semibold mb-2">
                  Game Over!
                  {todaysPlayerName && (
                    <div>The player was {todaysPlayerName}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Principales statistiques */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatBox label="GAMES PLAYED" value={stats.gamesPlayed} />
            <StatBox label="WIN %" value={winRate} />
            <StatBox label="CURRENT STREAK" value={stats.currentStreak} />
            <StatBox label="MAX STREAK" value={stats.maxStreak} />
          </div>

          {/* Distribution des essais */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white uppercase mb-3">
              Guess Distribution
            </h3>

            {stats.gamesPlayed === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No data yet. Play some games!
              </div>
            ) : (
              <div className="space-y-2">
                {stats.guessDistribution.map((count, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-white mr-3 w-4">{index + 1}</div>
                    <div className="flex-1 h-8 flex items-center">
                      <div
                        className={`h-full ${
                          gameResult &&
                          gameResult.won &&
                          gameResult.attemptsUsed === index + 1
                            ? "bg-green-500"
                            : count > 0
                            ? "bg-green-500"
                            : "bg-gray-700"
                        }`}
                        style={{
                          width:
                            count === 0 ? "0%" : `${(count / maxValue) * 100}%`,
                          minWidth: count > 0 ? "10%" : "0%",
                        }}
                      >
                        {count > 0 && (
                          <span className="text-white px-3 text-sm flex h-full items-center font-medium">
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

          {/* Historique des parties précédentes */}
          {stats.gameHistory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white uppercase mb-3">
                Previous Games
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                {stats.gameHistory.map((game, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-white mr-3 flex-shrink-0 w-40 text-sm">
                      {game.id}
                    </div>
                    <div className="flex space-x-1">
                      {game.guessResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`w-6 h-6 ${
                            result === "correct"
                              ? "bg-green-500"
                              : result === "close"
                              ? "bg-orange-500"
                              : "bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bouton de fermeture */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors uppercase"
            >
              OK, Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher une statistique
const StatBox: React.FC<{ label: string; value: number | string }> = ({
  label,
  value,
}) => (
  <div className="bg-gray-800 rounded p-3 text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400 mt-1 uppercase">{label}</div>
  </div>
);

export default HistoryStatsModal;
