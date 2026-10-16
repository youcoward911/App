import React from "react";
import { View, StyleSheet } from "react-native";

// Neumorphic dual-shadow wrapper.
// Figma uses two box-shadows on every surface:
//   1) -8px -8px 16px rgba(255,255,255,0.8)  — white highlight (top-left)
//   2)  8px  8px 16px rgba(209,197,201,0.6)   — dark shadow (bottom-right)
// React Native only supports ONE shadow per View.
// This component layers two Views to get both.

export default function NeuBox({
  children,
  style,
  // Figma defaults
  lightColor = "#FFFFFF",
  lightOffset = -8,
  lightOpacity = 0.8,
  lightRadius = 16,
  darkColor = "#D1C5C9",
  darkOffset = 8,
  darkOpacity = 0.6,
  darkRadius = 16,
  // Surface
  bg = "rgba(255,255,255,0.4)",
  borderColor = "rgba(255,255,255,0.6)",
  borderRadius = 20,
  // Pass-through
  onPress,
}) {
  const flatStyle = StyleSheet.flatten(style) || {};
  const {
    margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical,
    alignSelf, position, top, bottom, left, right, flex, zIndex,
    ...innerStyle
  } = flatStyle;

  const outerLayout = {
    margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical,
    alignSelf, position, top, bottom, left, right, flex, zIndex,
  };
  // Clean undefined values
  Object.keys(outerLayout).forEach(k => outerLayout[k] === undefined && delete outerLayout[k]);

  return (
    // Outer View: white highlight shadow (top-left)
    <View
      style={[
        outerLayout,
        {
          shadowColor: lightColor,
          shadowOffset: { width: lightOffset, height: lightOffset },
          shadowOpacity: lightOpacity,
          shadowRadius: lightRadius,
          elevation: 0,
          borderRadius,
        },
      ]}
    >
      {/* Inner View: dark shadow (bottom-right) + actual content */}
      <View
        style={[
          {
            backgroundColor: bg,
            borderWidth: 1,
            borderColor,
            borderRadius,
            shadowColor: darkColor,
            shadowOffset: { width: darkOffset, height: darkOffset },
            shadowOpacity: darkOpacity,
            shadowRadius: darkRadius,
            elevation: 6,
          },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
