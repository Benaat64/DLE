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
  leagueId: string; // ID de la ligue actuelle ou "all" pour toutes les ligues
  isGlobalStats?: boolean; // Afficher les statistiques globales ou seulement pour la ligue actuelle
}

// Composant pour afficher une statistique
const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="bg-gray-800 rounded p-3 text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400 mt-1 uppercase">{label}</div>
  </div>
);

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

  // Obtenir le titre de la ligue pour l'affichage
  const getLeagueTitle = (id: string): string => {
    const leagues = {
      all: "All Leagues",
      lec: "LEC",
      lck: "LCK",
      lpl: "LPL",
      lcs: "LCS",
      lta: "LTA",
    };

    return leagues[id.toLowerCase()] || id.toUpperCase();
  };

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

  // Utiliser la méthode appropriée pour obtenir le taux de victoire
  const winRate = isGlobalStats
    ? statsService.getWinRate()
    : statsService.getWinRateForLeague(leagueId);

  // Utiliser la méthode appropriée pour obtenir la valeur maximale de distribution
  const maxValue = isGlobalStats
    ? statsService.getMaxGuessDistributionValue()
    : statsService.getMaxGuessDistributionValueForLeague(leagueId);

  // Déterminer si nous devons organiser l'historique par ligue
  const shouldGroupByLeague = isGlobalStats;

  // Si on affiche les stats globales, organiser par ligue
  let gamesByLeague = {};
  let sortedLeagues = [];
  let leagueCounts = {};

  if (shouldGroupByLeague) {
    // Organiser l'historique des parties par ligue
    gamesByLeague = stats.gameHistory.reduce((acc, game) => {
      // Extraire la ligue du jeu à partir de l'ID (format : "game_YYYY-MM-DD_leagueId")
      const leagueMatch = game.id.match(/game_\d{4}-\d{2}-\d{2}_(.+)/);
      const league = leagueMatch ? leagueMatch[1].toUpperCase() : "UNKNOWN";

      if (!acc[league]) {
        acc[league] = [];
      }

      acc[league].push(game);
      return acc;
    }, {});

    // Trier les ligues par nom
    sortedLeagues = Object.keys(gamesByLeague).sort();

    // Compter le nombre de parties par ligue
    leagueCounts = sortedLeagues.reduce((acc, league) => {
      acc[league] = gamesByLeague[league].length;
      return acc;
    }, {});
  }

  // Formatter l'ID du jeu pour l'affichage
  const formatGameId = (gameId: string, league: string) => {
    if (shouldGroupByLeague) {
      // Format global : "LEC #1", "LCK #2", etc.
      const gameNumber =
        gamesByLeague[league].findIndex((g) => g.id === gameId) + 1;
      return `${league} #${gameNumber}`;
    } else {
      // Format spécifique à une ligue : "#1", "#2", etc.
      // Extraire le numéro de partie pour cette ligue
      const allGames = stats.gameHistory;
      // Trier par date (du plus ancien au plus récent)
      const sortedGames = [...allGames].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const gameIndex = sortedGames.findIndex((g) => g.id === gameId) + 1;
      return `#${gameIndex}`;
    }
  };

  // Rendu du contenu des onglets
  const renderTabContent = () => {
    if (activeTab === "stats") {
      return (
        <div className="stats-content">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {isGlobalStats
              ? "Global Statistics"
              : `${getLeagueTitle(leagueId)} Statistics`}
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

              {shouldGroupByLeague ? (
                // Affichage par ligue (pour les statistiques globales)
                <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                  {sortedLeagues.map((league) => (
                    <div key={league} className="mb-4">
                      <div className="flex justify-between items-center border-b border-gray-700 py-2 mb-2">
                        <h4 className="text-md font-semibold text-white">
                          {getLeagueTitle(league)}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {leagueCounts[league]} game
                          {leagueCounts[league] !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {gamesByLeague[league].map((game, index) => (
                          <div
                            key={index}
                            className="flex items-center hover:bg-gray-800 p-1 rounded"
                          >
                            <div className="text-white mr-3 flex-shrink-0 w-24 text-sm">
                              {formatGameId(game.id, league)}
                            </div>
                            <div className="flex space-x-1 flex-1">
                              {/* Inverser l'ordre des résultats pour afficher dans l'ordre chronologique */}
                              {[...game.guessResults]
                                .reverse()
                                .map((result, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 ${
                                      result === "correct"
                                        ? "bg-green-500"
                                        : result === "close"
                                        ? "bg-orange-500"
                                        : "bg-gray-700"
                                    }`}
                                    title={
                                      result === "correct"
                                        ? "Correct"
                                        : result === "close"
                                        ? "Close"
                                        : "Incorrect"
                                    }
                                  />
                                ))}
                            </div>
                            {game.playerName && (
                              <div className="text-gray-400 text-xs ml-2">
                                {game.playerName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Affichage simple pour une ligue spécifique
                <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                  <div className="space-y-3">
                    {/* Trier par date (du plus récent au plus ancien) */}
                    {[...stats.gameHistory]
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((game, index) => (
                        <div
                          key={index}
                          className="flex items-center hover:bg-gray-800 p-1 rounded"
                        >
                          <div className="text-white mr-3 flex-shrink-0 w-16 text-sm">
                            {formatGameId(game.id, leagueId)}
                          </div>
                          <div className="flex space-x-1 flex-1">
                            {/* Inverser l'ordre des résultats pour afficher dans l'ordre chronologique */}
                            {[...game.guessResults]
                              .reverse()
                              .map((result, idx) => (
                                <div
                                  key={idx}
                                  className={`w-6 h-6 ${
                                    result === "correct"
                                      ? "bg-green-500"
                                      : result === "close"
                                      ? "bg-orange-500"
                                      : "bg-gray-700"
                                  }`}
                                  title={
                                    result === "correct"
                                      ? "Correct"
                                      : result === "close"
                                      ? "Close"
                                      : "Incorrect"
                                  }
                                />
                              ))}
                          </div>
                          {game.playerName && (
                            <div className="text-gray-400 text-xs ml-2">
                              {game.playerName}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
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
            You have 8 attempts to guess the mystery LOL player. Every day there
            will be a new player to guess for each league!
          </p>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white uppercase mb-4">
              Results
            </h3>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500 mr-4"></div>
                <p className="text-white">Correct match</p>
              </div>

              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 mr-4"></div>
                <p className="text-white">
                  Partial match (same team, role, nationality or league)
                </p>
              </div>

              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-700 mr-4"></div>
                <p className="text-white">Incorrect match</p>
              </div>
            </div>
          </div>

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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl relative">
        <div className="p-6">
          {/* Bouton de fermeture en haut à droite */}
          <div className="absolute top-2 right-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              ✕
            </button>
          </div>

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

export default HistoryStatsModal;
