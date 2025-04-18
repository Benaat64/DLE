import { useParams, useNavigate } from "react-router-dom";
import { useGameEngine } from "../../core/GameEngine";
import GameTable from "../../components/GameTable";
import { LolApiAdapter } from "./api";
import { lolThemeConfig } from "./config";
import { createPlayerSelectionStrategy } from "../../core/playerSelectionStrategies";
import PlayerDetails from "./PlayerDetails";
import { LolPlayerData } from "./types";
import { useMemo, useState, useEffect } from "react";
import HistoryStatsModal from "../../components/HistoryStatsModal";
import { useEnhancedStats } from "../../core/useEnhancedGameStats";
import { GuessResult } from "../../core/EnhancedStatsTypes";

// Composant de timer pour afficher le temps restant jusqu'à la prochaine partie
const CountdownTimer = ({ getTimeUntilNextGame }) => {
  const [remainingTime, setRemainingTime] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Calculer le temps initial
    const updateRemainingTime = () => {
      const msRemaining = getTimeUntilNextGame();

      // Convertir en heures, minutes, secondes
      const hours = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (msRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

      setRemainingTime({ hours, minutes, seconds });

      // Si c'est minuit, recharger la page
      if (msRemaining <= 0) {
        window.location.reload();
      }
    };

    // Mettre à jour immédiatement
    updateRemainingTime();

    // Puis toutes les secondes
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilNextGame]);

  // Formater pour toujours afficher 2 chiffres
  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center justify-center bg-gray-800 rounded-lg p-4 text-3xl font-mono">
      <div className="flex items-center">
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.hours)}</span>
          <span className="text-xs text-gray-400">heures</span>
        </div>
        <span className="text-white">:</span>
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.minutes)}</span>
          <span className="text-xs text-gray-400">min</span>
        </div>
        <span className="text-white">:</span>
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.seconds)}</span>
          <span className="text-xs text-gray-400">sec</span>
        </div>
      </div>
    </div>
  );
};

const LOLGame = () => {
  // État pour le timer jusqu'à la prochaine partie
  const [timeUntilNextGame, setTimeUntilNextGame] = useState<number | null>(
    null
  );

  // Récupérer le paramètre de ligue de l'URL
  const { leagueId } = useParams<{ leagueId: string }>();
  const league = leagueId || "all";
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Toujours utiliser le mode production pour avoir le même joueur chaque jour
  const isDevelopment = false;

  // Configuration des statistiques spécifiques à cette ligue
  const statsConfig = useMemo(
    () => ({
      gameId: "lol",
      maxAttempts: lolThemeConfig.maxAttempts,
      leagueId: league,
    }),
    [league]
  );

  // Utiliser notre hook de statistiques amélioré (spécifique à la ligue)
  const {
    isStatsModalOpen,
    setStatsModalOpen,
    gameResult,
    statsService,
    recordGameEnd,
    showStats,
  } = useEnhancedStats(statsConfig);

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
  const selectionStrategy = useMemo(
    () =>
      createPlayerSelectionStrategy<LolPlayerData>(
        isDevelopment,
        leagueFilter,
        league
      ),
    [isDevelopment, leagueFilter, league]
  );

  // Utiliser notre GameEngine pour gérer la logique du jeu en passant la ligue
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
    getTimeUntilNextGame,
  } = useGameEngine<LolPlayerData>(
    adapter,
    lolThemeConfig,
    selectionStrategy,
    league
  );

  // Convertir les tentatives en résultats pour les statistiques
  // Cette fonction détermine si chaque tentative est correcte, proche ou incorrecte
  const generateGuessResults = (): GuessResult[] => {
    if (!targetPlayer || !guesses.length) return [];

    // Inverser les guesses pour qu'ils soient dans l'ordre chronologique (premier au dernier)
    return guesses
      .map((guess) => {
        if (guess.id === targetPlayer.id) {
          return "correct";
        }

        // Déterminer si c'est proche ou incorrect
        // Personnalisez cette logique selon vos règles de jeu
        const sameTeam = guess.team === targetPlayer.team;
        const sameRole = guess.role === targetPlayer.role;
        const sameNationality = guess.nationality === targetPlayer.nationality;
        const sameLeague = guess.league === targetPlayer.league;

        if (sameTeam || sameRole || sameNationality || sameLeague) {
          return "close";
        }

        return "incorrect";
      })
      .reverse(); // Inverser pour avoir l'ordre chronologique (premier essai en premier)
  };

  // Enregistrer le résultat du jeu lorsqu'il se termine
  useEffect(() => {
    if (gameOver && targetPlayer) {
      const won = guesses.some((g) => g.id === targetPlayer.id);
      const guessResults = generateGuessResults();

      // Un petit délai pour permettre au joueur de voir le résultat
      const timer = setTimeout(() => {
        recordGameEnd(won, attempts, guessResults, targetPlayer.name);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameOver, targetPlayer, guesses, attempts, recordGameEnd]);

  // Afficher un message d'information sur les tentatives sauvegardées
  const hasSavedGuesses = !loading && guesses.length > 0;

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
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/lol")}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to League Selection
        </button>

        {/* Bouton pour afficher les statistiques de cette ligue */}
        <button
          onClick={showStats}
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
        >
          <span className="mr-2">📊</span> {league.toUpperCase()} Stats
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
          {/* Message pour informer que les tentatives ont été restaurées */}
          {hasSavedGuesses && !gameOver && (
            <div className="text-blue-400 text-center mb-4 p-3 bg-gray-800 rounded-lg">
              Vos {attempts} tentative{attempts > 1 ? "s" : ""} précédente
              {attempts > 1 ? "s" : ""} d'aujourd'hui{" "}
              {attempts > 1 ? "ont été" : "a été"} restaurée
              {attempts > 1 ? "s" : ""}.
            </div>
          )}

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
            <div className="flex flex-col items-center mt-8">
              <div className="text-xl font-semibold text-white mb-2">
                Nouvelle partie disponible dans
              </div>

              <CountdownTimer getTimeUntilNextGame={getTimeUntilNextGame} />

              <p className="text-gray-400 mt-4 text-center">
                Une nouvelle partie sera disponible à minuit (heure locale)
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal des statistiques avec historique pour cette ligue */}
      <HistoryStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        statsService={statsService}
        gameResult={gameResult}
        todaysPlayerName={
          gameOver && targetPlayer ? targetPlayer.name : undefined
        }
        leagueId={league}
        isGlobalStats={false}
      />
    </div>
  );
};

export default LOLGame;
