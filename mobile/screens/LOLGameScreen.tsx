// screens/LOLGameScreen.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import tw from "twrnc";

import GameTable from "../components/GameTable";
import { RootStackParamList } from "../navigation";
import { LolPlayerData } from "../types/lol";

// Dans une vraie implémentation, ces imports viendraient de vos services partagés
// import { useGameEngine } from '../core/GameEngine';
// import { LolApiAdapter } from '../services/lol/api';
// import { lolThemeConfig } from '../constants/lolConfig';

type LOLGameScreenRouteProp = RouteProp<RootStackParamList, "LOLGame">;
type LOLGameScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LOLGame"
>;

// Composant timer pour afficher le temps restant jusqu'à la prochaine partie
const CountdownTimer = ({
  getTimeUntilNextGame,
}: {
  getTimeUntilNextGame: () => number;
}) => {
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Mettre à jour le timer
    const updateRemainingTime = () => {
      const msRemaining = getTimeUntilNextGame();

      // Convertir en heures, minutes, secondes
      const hours = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (msRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

      setRemainingTime({ hours, minutes, seconds });
    };

    // Mettre à jour immédiatement
    updateRemainingTime();

    // Puis toutes les secondes
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilNextGame]);

  // Format pour afficher deux chiffres
  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <View
      style={tw`flex-row items-center justify-center bg-gray-800 rounded-lg p-4`}
    >
      <View style={tw`flex-row items-center`}>
        <View style={tw`flex-col items-center mx-2`}>
          <Text style={tw`text-white text-2xl font-mono`}>
            {format(remainingTime.hours)}
          </Text>
          <Text style={tw`text-xs text-gray-400`}>heures</Text>
        </View>
        <Text style={tw`text-white text-2xl font-mono`}>:</Text>
        <View style={tw`flex-col items-center mx-2`}>
          <Text style={tw`text-white text-2xl font-mono`}>
            {format(remainingTime.minutes)}
          </Text>
          <Text style={tw`text-xs text-gray-400`}>min</Text>
        </View>
        <Text style={tw`text-white text-2xl font-mono`}>:</Text>
        <View style={tw`flex-col items-center mx-2`}>
          <Text style={tw`text-white text-2xl font-mono`}>
            {format(remainingTime.seconds)}
          </Text>
          <Text style={tw`text-xs text-gray-400`}>sec</Text>
        </View>
      </View>
    </View>
  );
};

// Pour cette démo, nous allons simuler quelques données
const dummyPlayers: LolPlayerData[] = [
  {
    id: "1",
    name: "Faker",
    team: "T1",
    league: "LCK",
    role: "MID",
    image: "https://example.com/faker.jpg",
    nationality: "Korea",
    countryCode: "kr",
    age: "27",
  },
  {
    id: "2",
    name: "Caps",
    team: "G2",
    league: "LEC",
    role: "MID",
    image: "https://example.com/caps.jpg",
    nationality: "Denmark",
    countryCode: "dk",
    age: "23",
  },
  // Plus de joueurs seraient ajoutés ici
];

const LOLGameScreen = () => {
  const route = useRoute<LOLGameScreenRouteProp>();
  const navigation = useNavigation<LOLGameScreenNavigationProp>();
  const { leagueId } = route.params;

  const [inputValue, setInputValue] = useState("");
  const [guesses, setGuesses] = useState<LolPlayerData[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [targetPlayer] = useState(dummyPlayers[0]); // Faker est le joueur à deviner
  const [selectedPlayer, setSelectedPlayer] = useState<LolPlayerData | null>(
    null
  );

  // Constantes pour le jeu
  const maxAttempts = 8;

  // Titre du jeu en fonction de la ligue
  const gameTitle = `LEAGUE-LE - ${leagueId.toUpperCase()}`;

  // Configuration des colonnes pour GameTable
  const columns = [
    { id: "name", title: "Player", renderer: "text", align: "left" },
    { id: "team", title: "Team", renderer: "text", align: "center" },
    { id: "role", title: "Role", renderer: "text", align: "center" },
    { id: "nationality", title: "Country", renderer: "flag", align: "center" },
    { id: "league", title: "League", renderer: "text", align: "center" },
  ];

  // Mapping des couleurs pour les comparaisons
  const colorMapping = {
    exact: "bg-green-600",
    similar: "bg-yellow-600",
    none: "",
    compare: (value: any, correctValue: any) => {
      if (value === correctValue) return "bg-green-600";
      return "";
    },
  };

  // Filtrer les suggestions en fonction de l'entrée
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return [];

    return dummyPlayers
      .filter(
        (player) =>
          player.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          player.league === leagueId.toUpperCase()
      )
      .map((player) => player.name)
      .slice(0, 10); // Limiter à 10 suggestions
  }, [inputValue, leagueId]);

  // Fonction pour ajouter une tentative
  const handleGuess = () => {
    setErrorMessage(null);

    // Trouver le joueur correspondant à l'entrée
    const playerToGuess = dummyPlayers.find(
      (p) => p.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (!playerToGuess) {
      setErrorMessage("Player not found. Try another name.");
      return;
    }

    if (playerToGuess.league !== leagueId.toUpperCase()) {
      setErrorMessage(
        `You can only guess players from ${leagueId.toUpperCase()} in this mode.`
      );
      return;
    }

    // Ajouter le joueur aux tentatives
    setGuesses((prev) => [playerToGuess, ...prev]);
    setAttempts((prev) => prev + 1);
    setInputValue("");

    // Vérifier si c'est le bon joueur ou si le joueur est à court de tentatives
    if (playerToGuess.id === targetPlayer.id || attempts + 1 >= maxAttempts) {
      setGameOver(true);
    }
  };

  // Sélectionner une suggestion
  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  // Fonction pour obtenir le temps jusqu'à la prochaine partie (minuit)
  const getTimeUntilNextGame = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <ScrollView style={tw`p-4`}>
        <View style={tw`mb-6 flex-row justify-between items-center`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`py-2`}
          >
            <Text style={tw`text-blue-400`}>← Back to League Selection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`py-2 flex-row items-center`}
            onPress={() => {
              /* Afficher les stats */
            }}
          >
            <Text style={tw`text-blue-400 mr-2`}>📊</Text>
            <Text style={tw`text-blue-400`}>
              {leagueId.toUpperCase()} Stats
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={tw`text-4xl font-bold text-white text-center mb-2`}>
          {gameTitle}
        </Text>
        <Text style={tw`text-lg text-gray-300 text-center mb-10`}>
          Guess the mystery LoL player from {leagueId.toUpperCase()}
        </Text>

        {loading ? (
          <View style={tw`flex items-center justify-center my-12`}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <>
            <View style={tw`relative mb-8`}>
              <TextInput
                style={tw`p-4 bg-gray-800 text-white rounded-lg border border-gray-700`}
                placeholder={`Enter a player name from ${leagueId.toUpperCase()}...`}
                placeholderTextColor="#9ca3af"
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  setErrorMessage(null);
                  setShowSuggestions(text.length > 0);
                }}
                onSubmitEditing={handleGuess}
                editable={!gameOver}
              />

              <TouchableOpacity
                style={tw`absolute right-2 top-2 px-6 py-2 rounded-lg bg-blue-600`}
                onPress={handleGuess}
                disabled={gameOver}
              >
                <Text style={tw`text-white font-semibold`}>Guess</Text>
              </TouchableOpacity>

              {showSuggestions && filteredSuggestions.length > 0 && (
                <View
                  style={tw`absolute top-full left-0 right-0 mt-2 rounded-lg bg-gray-800 z-20 max-h-40`}
                >
                  <FlatList
                    data={filteredSuggestions}
                    keyExtractor={(item, index) => `suggestion-${index}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={tw`p-3 border-b border-gray-700`}
                        onPress={() => selectSuggestion(item)}
                      >
                        <Text style={tw`text-white`}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>

            {errorMessage && (
              <View style={tw`bg-gray-800 rounded-lg p-3 mb-4`}>
                <Text style={tw`text-yellow-400 text-center`}>
                  {errorMessage}
                </Text>
              </View>
            )}

            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-lg font-semibold text-white`}>
                Attempts: <Text style={tw`text-blue-400`}>{attempts}</Text>/
                {maxAttempts}
              </Text>
              {gameOver && targetPlayer && (
                <Text style={tw`text-yellow-400 text-lg font-semibold`}>
                  {guesses.some((g) => g.id === targetPlayer.id)
                    ? `You won in ${attempts} ${
                        attempts === 1 ? "try" : "tries"
                      }!`
                    : `Game Over! The player was ${targetPlayer.name}`}
                </Text>
              )}
            </View>

            {guesses.length > 0 ? (
              <GameTable
                columns={columns}
                data={guesses}
                correctData={targetPlayer}
                colorMapping={colorMapping}
                onRowClick={(player) =>
                  setSelectedPlayer(player as LolPlayerData)
                }
              />
            ) : (
              <View style={tw`items-center justify-center py-12`}>
                <Text style={tw`text-gray-400 text-lg`}>
                  Start guessing players!
                </Text>
              </View>
            )}

            {gameOver && (
              <View style={tw`items-center mt-8`}>
                <Text style={tw`text-xl font-semibold text-white mb-2`}>
                  New game available in
                </Text>

                <CountdownTimer getTimeUntilNextGame={getTimeUntilNextGame} />

                <Text style={tw`text-gray-400 mt-4 text-center`}>
                  A new game will be available at midnight (local time)
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LOLGameScreen;
