import { GameHistoryEntry, GameStats } from "../core/EnhancedStatsTypes";

const leagueTitle = (id: string) => {
  const names: Record<string, string> = {
    all: "All Leagues", lec: "LEC", lck: "LCK", lpl: "LPL", lcs: "LCS", lta: "LTA",
  };
  return names[id.toLowerCase()] || id.toUpperCase();
};

const GameHistoryRow = ({ game, label, grouped }: {
  game: GameHistoryEntry;
  label: string;
  grouped: boolean;
}) => (
  <div className="flex items-center hover:bg-gray-800 p-1 rounded">
    <div className={`text-white mr-2 sm:mr-3 flex-shrink-0 ${grouped ? "w-16 sm:w-24" : "w-12 sm:w-16"} text-xs sm:text-sm`}>
      {label}
    </div>
    <div className="flex space-x-1 flex-1">
      {[...game.guessResults].reverse().map((result, index) => (
        <div
          key={index}
          className={`w-5 h-5 sm:w-6 sm:h-6 ${result === "correct" ? "bg-green-500" : result === "close" ? "bg-orange-500" : "bg-gray-700"}`}
          title={result === "correct" ? "Correct" : result === "close" ? "Close" : "Incorrect"}
        />
      ))}
    </div>
    {game.playerName && <div className="text-gray-400 text-xs ml-2">{game.playerName}</div>}
  </div>
);

const GameHistory = ({ stats, isGlobalStats }: { stats: GameStats; isGlobalStats: boolean }) => {
  if (stats.gameHistory.length === 0) return null;

  const chronological = [...stats.gameHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const groups = stats.gameHistory.reduce<Record<string, GameHistoryEntry[]>>((acc, game) => {
    const league = game.id.match(/game_\d{4}-\d{2}-\d{2}_(.+)/)?.[1].toUpperCase() || "UNKNOWN";
    (acc[league] ||= []).push(game);
    return acc;
  }, {});

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-semibold text-white uppercase mb-2 sm:mb-3">
        Previous Games
      </h3>
      <div className="max-h-60 sm:max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        {isGlobalStats ? Object.keys(groups).sort().map((league) => (
          <div key={league} className="mb-3 sm:mb-4">
            <div className="flex justify-between items-center border-b border-gray-700 py-1 sm:py-2 mb-1 sm:mb-2">
              <h4 className="text-sm sm:text-md font-semibold text-white">{leagueTitle(league)}</h4>
              <span className="text-xs sm:text-sm text-gray-400">
                {groups[league].length} game{groups[league].length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {groups[league].map((game, index) => (
                <GameHistoryRow key={game.id} game={game} label={`${league} #${index + 1}`} grouped />
              ))}
            </div>
          </div>
        )) : (
          <div className="space-y-2 sm:space-y-3">
            {[...chronological].reverse().map((game) => (
              <GameHistoryRow
                key={game.id}
                game={game}
                label={`#${chronological.findIndex((entry) => entry.id === game.id) + 1}`}
                grouped={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
