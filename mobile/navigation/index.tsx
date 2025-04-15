// navigation/index.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import tw from "twrnc";

// Importation des écrans
import GameSelection from "../screens/GameSelection";
import LeagueSelection from "../screens/LeagueSelection";
import LOLGameScreen from "../screens/LOLGameScreen";
// import CSGameScreen from "../screens/CSGameScreen"; // Reste commenté car CS n'est pas cliquable

// Type des paramètres pour les routes
export type RootStackParamList = {
  Home: undefined;
  LeagueSelection: undefined;
  LOLGame: { leagueId: string };
  CSGame: undefined;
  // Ajoutez d'autres routes au besoin
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: tw`bg-gray-900`.style,
          headerTintColor: "#fff",
          headerTitleStyle: tw`font-bold`.style,
          contentStyle: tw`bg-gray-900`.style,
        }}
      >
        <Stack.Screen
          name="Home"
          component={GameSelection}
          options={{ title: "DLE Games", headerShown: false }}
        />
        <Stack.Screen
          name="LeagueSelection"
          component={LeagueSelection}
          options={{ title: "Choisir une ligue" }}
        />
        <Stack.Screen
          name="LOLGame"
          component={LOLGameScreen}
          options={{ title: "League-le" }}
        />
        {/* <Stack.Screen
          name="CSGame"
          component={CSGameScreen}
          options={{ title: "Counter-Strikle" }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
