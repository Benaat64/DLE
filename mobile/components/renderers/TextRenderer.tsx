// components/renderers/TextRenderer.tsx
import React from "react";
import { Text } from "react-native";
import tw from "twrnc";
import { RendererProps } from "../GameTable/types";

const TextRenderer = ({ value }: RendererProps) => {
  return <Text style={tw`text-white`}>{value || "-"}</Text>;
};

export default TextRenderer;
