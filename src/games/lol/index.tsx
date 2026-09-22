// src/pages/lol/LOLGame.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useGameEngine } from "../../core/GameEngine";
import { LolApiAdapter } from "./api";
import { lolThemeConfig } from "./config";
import { createPlayerSelectionStrategy } from "../../core/playerSelectionStrategies";
import VictoryConfetti from "../../components/VictoryFireworks";
import { LolPlayerData } from "./types";
import { useMemo, useState, useEffect } from "react";
import PlayerGuessInput from "./PlayerGuessInput";
import GameProgress from "./GameProgress";
import HistoryStatsModal from "../../components/HistoryStatsModal";
import { useEnhancedStats } from "../../core/useEnhancedGameStats";
import { GuessResult } from "../../core/EnhancedStatsTypes";

const LOLGame = () => {
  // État pour afficher l'animation de victoire
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
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
    } else if (league === "lta-north") {
      return ["LTA North"]; // Seulement LTA Nord
    } else if (league === "lta-south") {
      return ["LTA South"]; // Seulement LTA Sud
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
    showSuggestions,
    error,
    setInputValue,
    handleGuess,
    selectSuggestion,
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
        const sameCountry = guess.country === targetPlayer.country; // Utiliser country au lieu de nationality
        const sameLeague = guess.league === targetPlayer.league;

        if (sameTeam || sameRole || sameCountry || sameLeague) {
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

      // Afficher l'animation de victoire si le joueur a gagné
      if (won) {
        // Afficher les feux d'artifice immédiatement
        setShowVictoryAnimation(true);
      }

      // Un petit délai pour permettre au joueur de voir le résultat
      const timer = setTimeout(() => {
        recordGameEnd(won, attempts, guessResults, targetPlayer.name);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameOver, targetPlayer, guesses, attempts, recordGameEnd]);

  // Titre ajusté en fonction de la ligue sélectionnée
  const gameTitle =
    league !== "all"
      ? `LEAGUE-LE - ${
          league === "lta-north"
            ? "LTA NORTH"
            : league === "lta-south"
            ? "LTA SOUTH"
            : league.toUpperCase()
        }`
      : "LEAGUE-LE";

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
      const leagueName =
        league === "lta-north"
          ? "LTA North"
          : league === "lta-south"
          ? "LTA South"
          : league.toUpperCase();

      setErrorMessage(
        `You can only guess players from ${leagueName} in this mode.`
      );
      return;
    }

    // Si on arrive ici, le joueur est valide pour cette ligue
    handleGuess();
  };

  // Fermer l'animation de victoire
  const handleCloseVictory = () => {
    setShowVictoryAnimation(false);
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
          <span className="mr-2">📊</span>{" "}
          {league === "all"
            ? "All"
            : league === "lta-north"
            ? "LTA North"
            : league === "lta-south"
            ? "LTA South"
            : league.toUpperCase()}{" "}
          Stats
        </button>
      </div>

      <h1 className="text-5xl font-bold text-white text-center mb-2 tracking-wider">
        {gameTitle}
      </h1>
      <p className="text-xl text-gray-300 text-center mb-10">
        Guess the mystery LoL player{" "}
        {league !== "all" &&
          `from ${
            league === "lta-north"
              ? "LTA North"
              : league === "lta-south"
              ? "LTA South"
              : league.toUpperCase()
          }`}
      </p>

      {loading ? (
        <div className="flex flex-col justify-center items-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300 text-lg">
            Please wait, loading players data...
          </p>
        </div>
      ) : error ? (
        <div className="text-yellow-400 text-center mb-4 p-4 bg-gray-800 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <PlayerGuessInput
            players={players}
            league={league}
            leagueFilter={leagueFilter}
            inputValue={inputValue}
            setInputValue={setInputValue}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            selectSuggestion={selectSuggestion}
            setErrorMessage={setErrorMessage}
            handleGuessWithLeagueCheck={handleGuessWithLeagueCheck}
            gameOver={gameOver}
          />

          {errorMessage && (
            <div className="text-yellow-400 text-center mb-4 p-3 bg-gray-800 rounded-lg">
              {errorMessage}
            </div>
          )}
          {/* Lien vers Liquipedia avec l'ancre #Participating_Teams */}
          <a
            href={`${
              league === "all"
                ? "https://liquipedia.net/leagueoflegends/Portal:Players"
                : `https://liquipedia.net/leagueoflegends/${
                    league === "lta-north"
                      ? "LTA/2025/Split_3/North"
                      : league === "lta-south"
                      ? "LTA/2025/Split_3/South"
                      : league === "lec"
                      ? "LEC/2025/Spring"
                      : league === "lck"
                      ? "LCK/2025"
                      : league === "lpl"
                      ? "LPL/2025/Split_3"
                      : league === "lcs"
                      ? "LCS/2025/Spring"
                      : "League_of_Legends_Esports"
                  }#Participating_Teams`
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="You may need to click on Show Players"
          >
            <span className="mr-2">📚</span>{" "}
            {league === "all"
              ? "LoL Players Portal"
              : league === "lta-north"
              ? "LTA North"
              : league === "lta-south"
              ? "LTA South"
              : league.toUpperCase()}{" "}
            {league === "all" ? "" : "Players list on Liquipedia"}
          </a>

          <GameProgress
            attempts={attempts}
            maxAttempts={maxAttempts}
            gameOver={gameOver}
            targetPlayer={targetPlayer}
            guesses={guesses}
            getTimeUntilNextGame={getTimeUntilNextGame}
          />
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

      {/* Animation de victoire avec feux d'artifice */}
      {targetPlayer && (
        <VictoryConfetti
          show={showVictoryAnimation}
          player={targetPlayer}
          onClose={handleCloseVictory}
        />
      )}
    </div>
  );
};

export default LOLGame;
