import { useState } from "react";
import GameTable from "../../components/GameTable";
import { Column, GameData, RendererType } from "../../components/GameTable/types";
import PlayerDetails from "./PlayerDetails";
import CountdownTimer from "./CountdownTimer";
import { lolThemeConfig } from "./config";
import { LolPlayerData } from "./types";

interface GameProgressProps {
  attempts: number;
  maxAttempts: number;
  gameOver: boolean;
  targetPlayer: LolPlayerData | null;
  guesses: LolPlayerData[];
  getTimeUntilNextGame: () => number;
}

const GameProgress = ({ attempts, maxAttempts, gameOver, targetPlayer, guesses, getTimeUntilNextGame }: GameProgressProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<LolPlayerData | null>(null);
  const columns: Column[] = lolThemeConfig.columns.map((column) => ({
    ...column,
    id: column.id as keyof GameData,
    renderer: column.renderer as RendererType,
  }));
  const tableRows = guesses.map((player) => ({ ...player, image: player.image || "" }));
  const correctRow = targetPlayer
    ? { ...targetPlayer, image: targetPlayer.image || "" }
    : undefined;
  return (
    <>
      <div className="text-white mb-6 flex justify-between items-center">
        <span className="text-lg font-semibold">
          Attempts: <span className="text-blue-400">{attempts}</span>/
          {maxAttempts}
        </span>
        {gameOver && targetPlayer && (
          <span className="text-yellow-400 text-lg font-semibold">
            {guesses.some((g) => g.id === targetPlayer.id)
              ? `You won in ${attempts} ${
                  attempts === 1 ? "try" : "tries"
                }!`
              : `Game Over! The player was ${targetPlayer.name}`}
          </span>
        )}
      </div>

      <GameTable
        columns={columns}
        data={tableRows}
        correctData={correctRow}
        colorMapping={lolThemeConfig.colorMapping}
        className="mb-8"
        onRowClick={(player) => setSelectedPlayer(guesses.find((guess) => guess.id === player.id) || null)}
      />

      {selectedPlayer && (
        <PlayerDetails
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {gameOver && (
        <div className="flex flex-col items-center mt-8">
          <div className="text-xl font-semibold text-white mb-2">
            New game available in
          </div>

          <CountdownTimer getTimeUntilNextGame={getTimeUntilNextGame} />

          <p className="text-gray-400 mt-4 text-center">
            A new game will be available at midnight (local time)
          </p>
        </div>
      )}
    </>
  );
};

export default GameProgress;
