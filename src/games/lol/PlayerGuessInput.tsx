import { useMemo, useState } from "react";
import { LolPlayerData } from "./types";

interface PlayerGuessInputProps {
  players: LolPlayerData[];
  league: string;
  leagueFilter: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (visible: boolean) => void;
  selectSuggestion: (name: string) => void;
  setErrorMessage: (message: string | null) => void;
  handleGuessWithLeagueCheck: () => void;
  gameOver: boolean;
}

const PlayerGuessInput = ({
  players, league, leagueFilter, inputValue, setInputValue,
  showSuggestions, setShowSuggestions, selectSuggestion, setErrorMessage,
  handleGuessWithLeagueCheck, gameOver,
}: PlayerGuessInputProps) => {
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    return players
      .filter((player) =>
        player.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        (league === "all" || leagueFilter.includes(player.league))
      )
      .map((player) => player.name)
      .slice(0, 10);
  }, [inputValue, players, league, leagueFilter]);

  return (
    <div className="relative flex items-center mb-8 gap-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setErrorMessage(null);
          setSelectedSuggestionIndex(-1); // Réinitialiser l'index quand l'utilisateur tape
        }}
        onKeyDown={(e) => {
          if (showSuggestions && filteredSuggestions.length > 0) {
            switch (e.key) {
              case "ArrowDown":
                e.preventDefault(); // Empêcher le défilement de la page
                setSelectedSuggestionIndex((prevIndex) =>
                  prevIndex < filteredSuggestions.length - 1
                    ? prevIndex + 1
                    : prevIndex
                );
                break;
              case "ArrowUp":
                e.preventDefault(); // Empêcher le défilement de la page
                setSelectedSuggestionIndex((prevIndex) =>
                  prevIndex > 0 ? prevIndex - 1 : -1
                );
                break;
              case "Enter":
                if (selectedSuggestionIndex >= 0) {
                  // Si une suggestion est sélectionnée, utilisez-la
                  e.preventDefault();
                  selectSuggestion(
                    filteredSuggestions[selectedSuggestionIndex]
                  );
                  setSelectedSuggestionIndex(-1);
                  setShowSuggestions(false);
                  setErrorMessage(null);
                } else {
                  // Si aucune suggestion n'est sélectionnée, faites une devinette
                  handleGuessWithLeagueCheck();
                }
                break;
              case "Tab":
                // Auto-compléter avec la première suggestion ou la sélectionnée
                if (filteredSuggestions.length > 0) {
                  e.preventDefault();
                  const indexToUse =
                    selectedSuggestionIndex >= 0
                      ? selectedSuggestionIndex
                      : 0;
                  selectSuggestion(filteredSuggestions[indexToUse]);
                  setSelectedSuggestionIndex(-1);
                  setShowSuggestions(false);
                  setErrorMessage(null);
                }
                break;
              case "Escape":
                // Fermer les suggestions
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
            }
          } else if (e.key === "Enter") {
            // Si pas de suggestions visibles, juste faire la devinette
            handleGuessWithLeagueCheck();
          }
        }}
        onFocus={() => {
          if (filteredSuggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() =>
          setTimeout(() => {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
          }, 200)
        }
        placeholder={`Enter a player name${
          league !== "all"
            ? ` from ${
                league === "lta-north"
                  ? "LTA North"
                  : league === "lta-south"
                  ? "LTA South"
                  : league.toUpperCase()
              }`
            : ""
        }...`}
        className="flex-1 p-4 bg-gray-800 text-white rounded-lg border border-gray-700 z-10 guess-input"
        disabled={gameOver}
      />
      <button
        onClick={handleGuessWithLeagueCheck}
        className="px-6 py-4 rounded-lg hover:bg-blue-700 guess-button"
        disabled={gameOver}
      >
        Guess
      </button>

      {showSuggestions && (
        <ul className="absolute top-full left-0 right-0 mt-2 rounded-lg max-h-60 overflow-y-auto z-20 suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`suggestion-${index}`}
              className={`p-3 cursor-pointer text-white suggestion-item ${
                index === selectedSuggestionIndex
                  ? "bg-blue-700"
                  : "hover:bg-gray-700"
              }`}
              onMouseDown={() => {
                selectSuggestion(suggestion);
                setErrorMessage(null);
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              tabIndex={0}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlayerGuessInput;
