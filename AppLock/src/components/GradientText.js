import React from "react";
import { Text } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

// Figma: bg-gradient-to-r from-[#ff69b4] to-[#2d2a2b], background-clip: text
// Renders gradient-filled text using MaskedView + LinearGradient.

export default function GradientText({
  children,
  style,
  colors = ["#2D2D2D", "#2D2D2D"],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}) {
  return (
    <MaskedView
      maskElement={<Text style={[style, { backgroundColor: "transparent" }]}>{children}</Text>}
    >
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}
