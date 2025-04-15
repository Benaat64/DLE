import { useState, useEffect, useRef, useCallback } from "react";
import {
  GameData,
  DataAdapter,
  ThemeConfig,
  PlayerSelectionStrategy,
} from "./types";
import { PlayerSearchHelper } from "./PlayerSearchHelper";

// Hook personnalisé pour gérer la logique du jeu
export const useGameEngine = <T extends GameData>(
  adapter: DataAdapter<T>,
  themeConfig: ThemeConfig<T>,
  selectionStrategy: PlayerSelectionStrategy<T>,
  leagueId: string = "all"
) => {
  const [players, setPlayers] = useState<T[]>([]);
  const [guesses, setGuesses] = useState<T[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [targetPlayer, setTargetPlayer] = useState<T | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<T | null>(null);
  const searchHelperRef = useRef<PlayerSearchHelper<T> | null>(null);
  const loadedRef = useRef(false); // Utiliser une ref pour éviter la boucle infinie

  const { maxAttempts, enrichPlayerDetails } = themeConfig;

  // Générer une clé unique pour chaque journée et chaque ligue
  const getDailyKey = useCallback((leagueId: string = "all") => {
    const today = new Date();
    return `game_${today.toISOString().split("T")[0]}_${leagueId}`;
  }, []);

  // Sauvegarder l'état du jeu dans le localStorage
  const saveGameState = useCallback(
    (newGuesses: T[], newAttempts: number, isOver: boolean) => {
      const dailyKey = getDailyKey(leagueId);
      try {
        localStorage.setItem(
          dailyKey,
          JSON.stringify({
            guesses: newGuesses,
            attempts: newAttempts,
            gameOver: isOver,
            timestamp: new Date().getTime(),
          })
        );
      } catch (e) {
        console.error("Error saving game state to localStorage:", e);
      }
    },
    [getDailyKey, leagueId]
  );

  // Charger l'état du jeu depuis localStorage
  const loadGameState = useCallback(() => {
    const dailyKey = getDailyKey(leagueId);
    try {
      const savedState = localStorage.getItem(dailyKey);
      if (savedState) {
        const {
          guesses: savedGuesses,
          attempts: savedAttempts,
          gameOver: savedGameOver,
        } = JSON.parse(savedState);
        return { savedGuesses, savedAttempts, savedGameOver };
      }
    } catch (e) {
      console.error("Error loading game state from localStorage:", e);
    }
    return null;
  }, [getDailyKey, leagueId]);

  // Charger les joueurs et initialiser le jeu
  useEffect(() => {
    // Éviter de charger plusieurs fois
    if (loadedRef.current) return;

    const loadPlayers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les joueurs depuis l'adaptateur
        const fetchedPlayers = await adapter.fetchPlayers();

        console.log("Liste complète des joueurs:", fetchedPlayers.length);

        if (fetchedPlayers.length === 0) {
          throw new Error("Aucun joueur récupéré de l'API");
        }

        setPlayers(fetchedPlayers);

        // Initialiser l'utilitaire de recherche
        searchHelperRef.current = new PlayerSearchHelper(fetchedPlayers);

        // Sélectionner un joueur cible en utilisant la stratégie fournie
        const selectedPlayer = selectionStrategy.selectPlayer(fetchedPlayers);

        if (selectedPlayer) {
          console.log("Joueur sélectionné:", selectedPlayer.name);

          // Enrichir le joueur cible avec des détails supplémentaires si nécessaire
          let enrichedPlayer = selectedPlayer;
          if (enrichPlayerDetails) {
            enrichedPlayer = await enrichPlayerDetails(selectedPlayer);
            console.log("Joueur avec détails:", enrichedPlayer.name);
          }
          setTargetPlayer(enrichedPlayer);

          // Charger l'état sauvegardé pour le jour en cours
          const savedState = loadGameState();
          if (savedState) {
            const { savedGuesses, savedAttempts, savedGameOver } = savedState;
            setGuesses(savedGuesses);
            setAttempts(savedAttempts);
            setGameOver(savedGameOver);
          }
        } else {
          console.error("Aucun joueur n'a pu être sélectionné");
        }

        loadedRef.current = true;
      } catch (error) {
        console.error("Erreur lors du chargement des joueurs:", error);
        setError(
          "Impossible de charger les données depuis l'API. Utilisation des données de test."
        );

        // Utiliser les données de test en cas d'erreur
        const testPlayers = await adapter.getTestPlayers();
        setPlayers(testPlayers);

        // Initialiser l'utilitaire de recherche avec les données de test
        searchHelperRef.current = new PlayerSearchHelper(testPlayers);

        // Sélectionner et enrichir un joueur de test
        const selectedPlayer = selectionStrategy.selectPlayer(testPlayers);
        if (selectedPlayer) {
          let enrichedPlayer = selectedPlayer;
          if (enrichPlayerDetails) {
            enrichedPlayer = await enrichPlayerDetails(selectedPlayer);
          }
          setTargetPlayer(enrichedPlayer);

          // Charger l'état sauvegardé pour le jour en cours
          const savedState = loadGameState();
          if (savedState) {
            const { savedGuesses, savedAttempts, savedGameOver } = savedState;
            setGuesses(savedGuesses);
            setAttempts(savedAttempts);
            setGameOver(savedGameOver);
          }
        }

        loadedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [adapter, selectionStrategy, enrichPlayerDetails, loadGameState]);

  // Gérer les suggestions de recherche
  useEffect(() => {
    if (inputValue.trim().length > 0 && searchHelperRef.current) {
      const guessedIds = guesses.map((g) => g.id);
      const suggestionsResult = searchHelperRef.current.getSuggestions(
        inputValue,
        5,
        guessedIds
      );
      setSuggestions(suggestionsResult);
      setShowSuggestions(suggestionsResult.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, guesses]);

  // Gérer une tentative de devinette
  const handleGuess = useCallback(async () => {
    if (!inputValue.trim() || gameOver || loading || !searchHelperRef.current)
      return;

    const guessedPlayer = searchHelperRef.current.findPlayer(inputValue);

    if (guessedPlayer) {
      if (guesses.some((g) => g.id === guessedPlayer.id)) return;

      // Mettre à jour les informations du joueur avec les détails si nécessaire
      let updatedPlayer = guessedPlayer;
      if (enrichPlayerDetails) {
        updatedPlayer = await enrichPlayerDetails(guessedPlayer);
      }

      const newGuesses = [updatedPlayer, ...guesses];
      const newAttempts = attempts + 1;
      let isGameOver = gameOver;

      setGuesses(newGuesses);
      setAttempts(newAttempts);

      if (guessedPlayer.id === targetPlayer?.id) {
        isGameOver = true;
        setGameOver(true);
      } else if (newAttempts >= maxAttempts) {
        isGameOver = true;
        setGameOver(true);
      }

      // Sauvegarder l'état du jeu après chaque tentative
      saveGameState(newGuesses, newAttempts, isGameOver);

      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
    } else if (inputValue.trim().length > 0) {
      console.log("Aucun joueur trouvé pour cette recherche");
    }
  }, [
    inputValue,
    gameOver,
    loading,
    enrichPlayerDetails,
    guesses,
    attempts,
    maxAttempts,
    targetPlayer,
    saveGameState,
  ]);

  // Sélectionner une suggestion
  const selectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Calculer le temps restant jusqu'à la prochaine partie (minuit)
  const getTimeUntilNextGame = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  }, []);

  // Réinitialiser le jeu
  const resetGame = useCallback(() => {
    // Effacer les données du jour en cours
    localStorage.removeItem(getDailyKey(leagueId));

    // Reset game state
    setGuesses([]);
    setAttempts(0);
    setGameOver(false);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedPlayer(null);

    // Reset loadedRef to allow reloading players
    loadedRef.current = false;

    // Reload will happen in the useEffect since loadedRef is now false
    setLoading(true);
  }, [getDailyKey, leagueId]);

  // Retourner les propriétés et méthodes nécessaires
  return {
    // État
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

    // Actions
    setInputValue,
    handleGuess,
    selectSuggestion,
    setSelectedPlayer,
    resetGame,
    setShowSuggestions,
    getTimeUntilNextGame,
  };
};
