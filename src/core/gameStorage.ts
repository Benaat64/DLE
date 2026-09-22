import type { GameData } from "./types";

interface SavedGame<T> {
  savedGuesses: T[];
  savedAttempts: number;
  savedGameOver: boolean;
}

const dailyKey = (leagueId: string) =>
  `game_${new Date().toISOString().split("T")[0]}_${leagueId}`;

export const saveGameState = <T extends GameData>(
  leagueId: string,
  guesses: T[],
  attempts: number,
  gameOver: boolean
) => {
  try {
    localStorage.setItem(
      dailyKey(leagueId),
      JSON.stringify({ guesses, attempts, gameOver, timestamp: Date.now() })
    );
  } catch (error) {
    console.error("Error saving game state to localStorage:", error);
  }
};

export const loadGameState = <T extends GameData>(
  leagueId: string
): SavedGame<T> | null => {
  try {
    const savedState = localStorage.getItem(dailyKey(leagueId));
    if (!savedState) return null;

    const { guesses, attempts, gameOver } = JSON.parse(savedState);
    if (!Array.isArray(guesses) || !Number.isInteger(attempts) ||
        typeof gameOver !== "boolean") return null;

    return {
      savedGuesses: guesses as T[],
      savedAttempts: attempts,
      savedGameOver: gameOver,
    };
  } catch (error) {
    console.error("Error loading game state from localStorage:", error);
    return null;
  }
};

export const clearGameState = (leagueId: string) => {
  try {
    localStorage.removeItem(dailyKey(leagueId));
  } catch (error) {
    console.error("Error clearing game state from localStorage:", error);
  }
};
