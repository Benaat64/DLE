import { GameStats, GameResult } from "../core/EnhancedStatsTypes";
import { EnhancedStatsService } from "../core/EnhancedStatsService";
import GameHistory from "./GameHistory";

interface StatsTabProps {
  stats: GameStats;
  statsService: EnhancedStatsService;
  gameResult?: GameResult | null;
  todaysPlayerName?: string;
  leagueId: string;
  isGlobalStats: boolean;
}

// Composant pour afficher une statistique
const StatBox = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className="bg-gray-800 rounded p-2 sm:p-3 text-center">
    <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400 mt-1 uppercase">{label}</div>
  </div>
);

const StatsTab = ({ stats, statsService, gameResult, todaysPlayerName, leagueId, isGlobalStats }: StatsTabProps) => {
  // Obtenir le titre de la ligue pour l'affichage
  const getLeagueTitle = (id: string): string => {
    const leagues: Record<string, string> = {
      all: "All Leagues",
      lec: "LEC",
      lck: "LCK",
      lpl: "LPL",
      lcs: "LCS",
      lta: "LTA",
    };

    return leagues[id.toLowerCase()] || id.toUpperCase();
  };

  // Utiliser la méthode appropriée pour obtenir le taux de victoire
  const winRate = isGlobalStats
    ? statsService.getWinRate()
    : statsService.getWinRateForLeague(leagueId);

  // Utiliser la méthode appropriée pour obtenir la valeur maximale de distribution
  const maxValue = isGlobalStats
    ? statsService.getMaxGuessDistributionValue()
    : statsService.getMaxGuessDistributionValueForLeague(leagueId);

  return (
        <div className="stats-content">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
            {isGlobalStats
              ? "Global Statistics"
              : `${getLeagueTitle(leagueId)} Statistics`}
          </h2>

          {/* Résultat de la partie actuelle si disponible */}
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
            </div>
          )}

          {/* Principales statistiques */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <StatBox label="GAMES PLAYED" value={stats.gamesPlayed} />
            <StatBox label="WIN %" value={winRate} />
            <StatBox label="CURRENT STREAK" value={stats.currentStreak} />
            <StatBox label="MAX STREAK" value={stats.maxStreak} />
          </div>

          {/* Distribution des essais */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white uppercase mb-2 sm:mb-3">
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
                    <div className="text-white mr-2 sm:mr-3 w-4 text-sm sm:text-base">
                      {index + 1}
                    </div>
                    <div className="flex-1 h-6 sm:h-8 flex items-center">
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
                          <span className="text-white px-2 sm:px-3 text-xs sm:text-sm flex h-full items-center font-medium">
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

          <GameHistory stats={stats} isGlobalStats={isGlobalStats} />
        </div>
  );
};

export default StatsTab;
