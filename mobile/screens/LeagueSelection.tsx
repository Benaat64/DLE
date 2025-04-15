// screens/LeagueSelection.tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import tw from "twrnc";
import { RootStackParamList } from "../navigation";

// Dans une implémentation complète, ce hook serait importé de vos services partagés
// import { useEnhancedStats } from '../core/useEnhancedGameStats';

type LeagueSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LeagueSelection"
>;

interface League {
  id: string;
  name: string;
  image: string;
}

const LeagueSelection = () => {
  const navigation = useNavigation<LeagueSelectionNavigationProp>();

  // Config pour les statistiques globales (à implémenter avec votre logique partagée)
  // const statsConfig = {
  //   gameId: "lol",
  //   maxAttempts: 8,
  //   leagueId: "all",
  // };

  // Hook de statistiques (à adapter pour React Native)
  // const {
  //   isStatsModalOpen,
  //   setStatsModalOpen,
  //   statsService,
  //   showStats,
  //   isGlobalStats,
  // } = useEnhancedStats(statsConfig, { isGlobalStats: true });

  // Fonction pour afficher les statistiques globales
  const showStats = () => {
    // Dans l'implémentation finale, cette fonction ouvrirait le modal des stats
    console.log("Show global stats");
  };

  const availableLeagues: League[] = [
    {
      id: "all",
      name: "All Leagues",
      image:
        "https://www.sheepesports.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F9rqbl8zs%2Fproduction%2Fb726c7b2058947e2c6358cb0eb5303c7bf7f7d29-1920x1080.webp&w=3840&q=75",
    },
    {
      id: "lec",
      name: "LEC",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/e/ef/League_of_Legends_EMEA_Championship.png",
    },
    {
      id: "lck",
      name: "LCK",
      image: "https://upload.wikimedia.org/wikipedia/fr/1/12/LCK_Logo.svg",
    },
    {
      id: "lpl",
      name: "LPL",
      image: "https://upload.wikimedia.org/wikipedia/fr/4/4a/LPL_LoL_Logo.png",
    },
    {
      id: "lta",
      name: "LTA",
      image:
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/League_of_Legends_Championship_of_The_Americas_logo.svg/640px-League_of_Legends_Championship_of_The_Americas_logo.svg.png",
    },
  ];

  const selectLeague = (leagueId: string) => {
    navigation.navigate("LOLGame", { leagueId });
  };

  const renderLeagueItem = ({ item }: { item: League }) => (
    <TouchableOpacity
      style={tw`bg-gray-800 rounded-lg p-6 mb-4 items-center`}
      onPress={() => selectLeague(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={tw`h-24 w-48 mb-4 justify-center items-center overflow-hidden`}
      >
        <Image
          source={{ uri: item.image }}
          style={tw`w-full h-full`}
          resizeMode="contain"
          // Dans React Native, nous utilisons onError différemment
          onError={() => {
            // Vous pourriez implémenter un fallback si nécessaire
            console.log(`Failed to load image for ${item.name}`);
          }}
        />
      </View>
      <Text style={tw`text-xl font-bold text-white`}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-900`}>
      <View style={tw`px-4 py-6 flex-1`}>
        <View style={tw`mb-6 flex-row justify-between items-center`}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={tw`py-2`}
          >
            <Text style={tw`text-blue-400`}>← Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`py-2 flex-row items-center`}
            onPress={showStats}
          >
            <Text style={tw`text-blue-400 mr-2`}>📊</Text>
            <Text style={tw`text-blue-400`}>Global Stats</Text>
          </TouchableOpacity>
        </View>

        <Text style={tw`text-4xl font-bold text-white text-center mb-2`}>
          LEAGUE-LE
        </Text>
        <Text style={tw`text-lg text-gray-300 text-center mb-8`}>
          Choose a league to start playing
        </Text>

        <FlatList
          data={availableLeagues}
          renderItem={renderLeagueItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-4`}
        />
      </View>

      {/* Dans l'implémentation finale, vous auriez un composant modal pour les statistiques */}
      {/* <StatsModal
        isVisible={isStatsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        statsService={statsService}
        leagueId="all"
        isGlobalStats={true}
      /> */}
    </SafeAreaView>
  );
};

export default LeagueSelection;
