// src/components/EnhancedStatsModal.tsx
import React, { useEffect, useState } from "react";
import { GameStats, GameResult, StatsService } from "../core/types";

export interface EnhancedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsService: StatsService;
  gameResult?: GameResult | null;

  gameId: string; // Identifiant du jeu (ex: "lol", "cs", etc.)
  maxAttempts: number;
  previousGames?: PreviousGame[]; // Historique des parties précédentes
}

export interface PreviousGame {
  id: string; // Identifiant de la partie (ex: "Counter-Strike #998")
  guesses: GuessResult[]; // Résultats des tentatives
}

export type GuessResult = "correct" | "close" | "incorrect";

const EnhancedStatsModal: React.FC<EnhancedStatsModalProps> = ({
  isOpen,
  onClose,
  statsService,
  gameResult,

  gameId,
  maxAttempts,
  previousGames = [],
}) => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "howToPlay">("stats");

  // Charger les statistiques lors de l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      // Si un résultat de jeu est fourni, l'enregistrer
      if (gameResult) {
        statsService.recordGameResult(gameResult);
      }

      // Charger les statistiques mises à jour
      setStats(statsService.getStats());
    }
  }, [isOpen, gameResult, statsService]);

  if (!isOpen || !stats) return null;

  const winRate = statsService.getWinRate();
  const maxValue = statsService.getMaxGuessDistributionValue();

  // Rendu du contenu des onglets
  const renderTabContent = () => {
    if (activeTab === "stats") {
      return (
        <div className="stats-content">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Your statistics
          </h2>

          {/* Principales statistiques */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatBox label="GAMES PLAYED" value={stats.gamesPlayed} />
            <StatBox label="WIN %" value={`${winRate}`} />
            <StatBox label="CURRENT STREAK" value={stats.currentStreak} />
            <StatBox label="MAX STREAK" value={stats.maxStreak} />
          </div>

          {/* Distribution des essais */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white uppercase mb-4">
              Guess Distribution
            </h3>

            {stats.gamesPlayed === 0 ? (
              <div className="text-gray-400 text-center py-4">
                No data yet. Play some games!
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: maxAttempts }).map((_, index) => {
                  const count = stats.guessDistribution[index] || 0;

                  return (
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
                              count === 0
                                ? "0%"
                                : `${(count / maxValue) * 100}%`,
                            minWidth: count > 0 ? "10%" : "0%",
                          }}
                        >
                          {count > 0 && (
                            <span className="text-white px-3 text-sm flex h-full items-center">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Parties précédentes */}
          {previousGames.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white uppercase mb-4">
                Previous Games
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {previousGames.map((game, index) => (
                  <div key={index} className="flex items-center">
                    <div className="text-white mr-3 flex-shrink-0 w-40 text-sm">
                      {game.id}
                    </div>
                    <div className="flex space-x-1">
                      {game.guesses.map((guess, guessIndex) => (
                        <div
                          key={guessIndex}
                          className={`w-6 h-6 rounded-sm ${
                            guess === "correct"
                              ? "bg-green-500"
                              : guess === "close"
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
      );
    } else {
      // Affichage de l'onglet "How to play"
      return (
        <div className="how-to-play-content">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            How to play
          </h2>

          <p className="text-white mb-6">
            You have {maxAttempts} attempts to guess the mystery {gameId}{" "}
            player. Everyday there will be a new {gameId} so make sure you come
            back daily!
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white uppercase mb-4">
              Answers
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-28 h-8 bg-green-500 flex items-center justify-center mr-4">
                  Green boxes
                </div>
                <p className="text-white">are correct answers.</p>
              </div>

              <div className="flex items-center">
                <div className="w-28 h-8 bg-orange-500 flex items-center justify-center mr-4">
                  Orange boxes
                </div>
                <p className="text-white">are close answers.</p>
              </div>

              <div className="flex items-center">
                <div className="w-28 h-8 bg-gray-700 flex items-center justify-center mr-4">
                  Blank boxes
                </div>
                <p className="text-white">are incorrect answers.</p>
              </div>
            </div>

            <div className="mt-4 text-white flex items-center">
              <span className="mr-2">👆</span> Hover on each answer for more
              help.
            </div>
          </div>

          {/* Régions (si applicable) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white uppercase mb-4">
              Regions
            </h3>
            <p className="text-white">
              North America, South America, Europe, CIS, Middle East & Africa,
              Asia, Oceania
            </p>
          </div>

          {/* Bouton de fermeture */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors uppercase"
            >
              OK, Cool
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full mx-4 overflow-hidden shadow-xl">
        <div className="p-6">
          {/* En-tête avec onglets */}
          <div className="flex justify-center mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("howToPlay")}
              className={`px-4 py-2 text-white ${
                activeTab === "howToPlay"
                  ? "border-b-2 border-white"
                  : "opacity-70"
              }`}
            >
              HOW TO PLAY
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 text-white ${
                activeTab === "stats" ? "border-b-2 border-white" : "opacity-70"
              }`}
            >
              MY STATS
            </button>
          </div>

          {/* Contenu de l'onglet actif */}
          {renderTabContent()}
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
  <div className="bg-gray-800 rounded p-4 text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400 mt-1 uppercase">{label}</div>
  </div>
);

export default EnhancedStatsModal;
