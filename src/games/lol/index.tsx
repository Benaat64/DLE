import { useParams, useNavigate } from "react-router-dom";
import { useGameEngine } from "../../core/GameEngine";
import GameTable from "../../components/GameTable";
import { LolApiAdapter } from "./api";
import { lolThemeConfig } from "./config";
import { createPlayerSelectionStrategy } from "../../core/playerSelectionStrategies";
import PlayerDetails from "./PlayerDetails";
import { LolPlayerData } from "./types";
import { useMemo, useState } from "react";

const LOLGame = () => {
  // Récupérer le paramètre de ligue de l'URL
  const { leagueId } = useParams<{ leagueId: string }>();
  const league = leagueId || "all";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Toujours utiliser le mode production pour avoir le même joueur chaque jour
  const isDevelopment = false;

  // Filtrer les joueurs selon la ligue sélectionnée
  const leagueFilter = useMemo(() => {
    if (league === "all") {
      return ["LEC", "LCK", "LPL", "LCS", "LTA North", "LTA South"]; // Toutes les ligues
    } else if (league === "lta") {
      return ["LTA North", "LTA South"]; // Les deux régions LTA combinées
    }
    // Sinon, seulement la ligue spécifiée
    return [league.toUpperCase()];
  }, [league]);

  // Créer l'adaptateur API (mémorisé pour éviter les recréations)
  const adapter = useMemo(() => new LolApiAdapter(), []);

  // Créer la stratégie de sélection des joueurs (mémorisée)
  // Passer la ligue comme seed supplémentaire pour avoir un joueur différent par ligue
  const selectionStrategy = useMemo(
    () =>
      createPlayerSelectionStrategy<LolPlayerData>(
        isDevelopment,
        leagueFilter,
        league
      ),
    [isDevelopment, leagueFilter, league]
  );

  // Utiliser notre GameEngine pour gérer la logique du jeu
  const {
    players,
    guesses,
    inputValue,
    targetPlayer,
    gameOver,
    attempts,
    maxAttempts,
    loading,
    suggestions,
    showSuggestions,
    error,
    selectedPlayer,
    setInputValue,
    handleGuess,
    selectSuggestion,
    setSelectedPlayer,
    resetGame,
    setShowSuggestions,
  } = useGameEngine<LolPlayerData>(adapter, lolThemeConfig, selectionStrategy);

  // Titre ajusté en fonction de la ligue sélectionnée
  const gameTitle =
    league !== "all" ? `LEAGUE-LE - ${league.toUpperCase()}` : "LEAGUE-LE";

  // Filtrer les suggestions pour n'afficher que les joueurs de la ligue sélectionnée
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    return players
      .filter(
        (player) =>
          player.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          (league === "all" || leagueFilter.includes(player.league))
      )
      .map((player) => player.name)
      .slice(0, 10); // Limiter à 10 suggestions
  }, [inputValue, players, league, leagueFilter]);

  // Fonction modifiée pour vérifier si le joueur appartient à la bonne ligue
  const handleGuessWithLeagueCheck = () => {
    setErrorMessage(null);

    // Trouver le joueur correspondant à l'entrée
    const playerToGuess = players.find(
      (p) => p.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (!playerToGuess) {
      // Joueur non trouvé
      setErrorMessage("Player not found. Try another name.");
      return;
    }

    if (league !== "all" && !leagueFilter.includes(playerToGuess.league)) {
      // Joueur d'une autre ligue
      setErrorMessage(
        `You can only guess players from ${
          league === "lta" ? "LTA" : league.toUpperCase()
        } in this mode.`
      );
      return;
    }

    // Si on arrive ici, le joueur est valide pour cette ligue
    handleGuess();
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/lol")}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to League Selection
        </button>
      </div>

      <h1 className="text-5xl font-bold text-white text-center mb-2 tracking-wider">
        {gameTitle}
      </h1>
      <p className="text-xl text-gray-300 text-center mb-10">
        Guess the mystery LoL player{" "}
        {league !== "all" &&
          `from ${league === "lta" ? "LTA" : league.toUpperCase()}`}
      </p>

      {loading ? (
        <div className="flex justify-center items-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-yellow-400 text-center mb-4 p-4 bg-gray-800 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <div className="relative flex items-center mb-8 gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGuessWithLeagueCheck();
                } else if (
                  e.key === "ArrowDown" &&
                  showSuggestions &&
                  filteredSuggestions.length > 0
                ) {
                  document.getElementById("suggestion-0")?.focus();
                }
              }}
              onFocus={() => {
                if (filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={`Enter a player name${
                league !== "all"
                  ? ` from ${league === "lta" ? "LTA" : league.toUpperCase()}`
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
                    className="p-3 hover:bg-gray-700 cursor-pointer text-white suggestion-item"
                    onMouseDown={() => {
                      selectSuggestion(suggestion);
                      setErrorMessage(null);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        selectSuggestion(suggestion);
                        setErrorMessage(null);
                      } else if (
                        e.key === "ArrowDown" &&
                        index < filteredSuggestions.length - 1
                      ) {
                        document
                          .getElementById(`suggestion-${index + 1}`)
                          ?.focus();
                      } else if (e.key === "ArrowUp") {
                        if (index > 0) {
                          document
                            .getElementById(`suggestion-${index - 1}`)
                            ?.focus();
                        } else {
                          document.querySelector("input")?.focus();
                        }
                      }
                    }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {errorMessage && (
            <div className="text-yellow-400 text-center mb-4 p-3 bg-gray-800 rounded-lg">
              {errorMessage}
            </div>
          )}

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
            columns={lolThemeConfig.columns}
            data={guesses}
            correctData={targetPlayer}
            colorMapping={lolThemeConfig.colorMapping}
            className="mb-8"
            allPlayers={players}
            onRowClick={(player) => setSelectedPlayer(player as LolPlayerData)}
          />

          {selectedPlayer && (
            <PlayerDetails
              player={selectedPlayer}
              onClose={() => setSelectedPlayer(null)}
            />
          )}

          {gameOver && (
            <div className="flex justify-center mt-8">
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold tracking-wide text-lg transition-all"
              >
                Play Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LOLGame;
