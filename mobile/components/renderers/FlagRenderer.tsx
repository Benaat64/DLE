// components/renderers/FlagRenderer.tsx
import React from "react";
import { View, Text, Image } from "react-native";
import tw from "twrnc";
import { RendererProps } from "../GameTable/types";
import { getCountryCode } from "../../utils/countriesUtil";

// Pour React Native, nous utiliserons des images au lieu de composants SVG
// Nous devrons créer un map des codes de pays vers les URLs des drapeaux
const FlagRenderer = ({ value, countryCode }: RendererProps) => {
  // Si le countryCode est fourni, l'utiliser; sinon essayer de le dériver du nom du pays
  const code = countryCode || getCountryCode(value);

  if (code) {
    try {
      // Utilisons une API de drapeaux gratuite comme source d'images
      // Exemple: https://flagcdn.com/w40/us.png
      const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

      return (
        <View style={tw`flex-row items-center`}>
          <Image
            source={{ uri: flagUrl }}
            style={tw`w-5 h-3.5 mr-1`}
            resizeMode="cover"
          />
          <Text style={tw`text-white ml-1`}>{value}</Text>
        </View>
      );
    } catch (e) {
      console.error("Erreur avec le drapeau:", e);
      return (
        <Text style={tw`text-white`}>
          ({code.toUpperCase()}) {value}
        </Text>
      );
    }
  }

  return <Text style={tw`text-white`}>{value}</Text>;
};

export default FlagRenderer;
