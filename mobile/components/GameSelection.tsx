// components/GameSelection.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc"; // Import TailwindCSS pour React Native

interface Game {
  id: string;
  name: string;
  hasLeagues?: boolean;
  color: string;
  bgStyle: string; // Style Tailwind pour l'arrière-plan
  icon?: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  isAvailable: boolean;
}

// Catégories disponibles
const categories: Category[] = [
  {
    id: "esport",
    name: "Esport",
    isAvailable: true,
  },
  {
    id: "sport",
    name: "Sport",
    isAvailable: false,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    isAvailable: false,
  },
];

// Liste complète des jeux par catégorie
const allGames: Game[] = [
  // Esport
  {
    id: "cs",
    name: "Counter-Strikle",
    color: "#f59e0b",
    bgStyle: "bg-amber-500",
    icon: "🔫",
    category: "esport",
  },
  {
    id: "lol",
    name: "League-le",
    hasLeagues: true,
    color: "#7c3aed",
    bgStyle: "bg-violet-600",
    icon: "🏆",
    category: "esport",
  },
  {
    id: "valorant",
    name: "Valorant-le",
    color: "#dc2626",
    bgStyle: "bg-red-600",
    icon: "🎯",
    category: "esport",
  },
  // Sport
  {
    id: "football",
    name: "Football-le",
    hasLeagues: true,
    color: "#16a34a",
    bgStyle: "bg-green-600",
    icon: "⚽",
    category: "sport",
  },
  {
    id: "basketball",
    name: "NBA-le",
    hasLeagues: true,
    color: "#ea580c",
    bgStyle: "bg-orange-600",
    icon: "🏀",
    category: "sport",
  },
  // Entertainment
  {
    id: "movies",
    name: "Movie-le",
    color: "#4338ca",
    bgStyle: "bg-indigo-700",
    icon: "🎬",
    category: "entertainment",
  },
  {
    id: "music",
    name: "Music-le",
    color: "#be185d",
    bgStyle: "bg-pink-700",
    icon: "🎵",
    category: "entertainment",
  },
];

const GameSelection = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState("esport");

  const selectGame = (gameId: string, hasLeagues: boolean = false) => {
    if (hasLeagues) {
      // @ts-ignore - nous gérerons la navigation correctement plus tard
      navigation.navigate(gameId); // Navigue vers la sélection de ligue
    } else {
      // @ts-ignore - nous gérerons la navigation correctement plus tard
      navigation.navigate(`${gameId}Play`); // Navigue directement vers le jeu
    }
  };

  // Filtrer les jeux par catégorie active
  const filteredGames = allGames.filter(
    (game) => game.category === activeCategory
  );

  // Vérifier si la catégorie est disponible
  const isCategoryAvailable =
    categories.find((c) => c.id === activeCategory)?.isAvailable || false;

  // Rendu d'une catégorie
  const renderCategory = ({ item }: { item: Category }) => (
    <View style={tw`relative mx-1.5`}>
      <TouchableOpacity
        onPress={() => setActiveCategory(item.id)}
        style={tw`px-4 py-2.5 rounded-lg ${
          activeCategory === item.id ? "bg-violet-900 scale-105" : "bg-gray-700"
        } ${!item.isAvailable ? "opacity-70" : ""}`}
        disabled={!item.isAvailable}
      >
        <Text
          style={tw`font-semibold ${
            activeCategory === item.id
              ? "text-white"
              : item.isAvailable
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>

      {!item.isAvailable && (
        <View
          style={tw`absolute -top-2 -right-2 bg-yellow-500 px-1.5 py-0.5 rounded-full -rotate-12`}
        >
          <Text style={tw`text-black text-xs font-bold`}>Coming Soon</Text>
        </View>
      )}
    </View>
  );

  // Rendu d'un jeu
  const renderGame = ({ item }: { item: Game }) => (
    <TouchableOpacity
      onPress={() =>
        isCategoryAvailable && selectGame(item.id, item.hasLeagues)
      }
      style={tw`p-4 rounded-xl mb-3 ${item.bgStyle} ${
        !isCategoryAvailable ? "opacity-50" : ""
      }`}
      disabled={!isCategoryAvailable}
    >
      <View style={tw`flex-row items-center`}>
        {item.icon && <Text style={tw`text-3xl mr-3`}>{item.icon}</Text>}
        <View style={tw`flex-1`}>
          <Text style={tw`text-xl font-bold text-white`}>{item.name}</Text>
          <Text style={tw`text-white opacity-80`}>
            Guess the {item.id.toUpperCase()} player
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-950 p-4`}>
      <Text style={tw`text-4xl font-bold text-white text-center mb-2`}>
        DLE GAMES
      </Text>
      <Text style={tw`text-lg text-gray-300 text-center mb-6`}>
        Choose your game
      </Text>

      {/* Liste des catégories */}
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`py-4 mb-4 justify-center`}
      />

      {/* Liste des jeux */}
      <FlatList
        data={filteredGames}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-4`}
      />
    </View>
  );
};

export default GameSelection;
