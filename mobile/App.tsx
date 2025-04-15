// App.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import tw from "twrnc";
import Navigation from "./navigation";

export default function App() {
  return (
    <SafeAreaProvider style={tw`flex-1 bg-gray-900`}>
      <StatusBar style="light" />
      <Navigation />
    </SafeAreaProvider>
  );
}
