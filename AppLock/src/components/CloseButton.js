import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { lightTap } from "../utils/haptics";

export default function CloseButton({ onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      activeOpacity={0.6}
      onPress={() => { lightTap(); onPress(); }}
    >
      <View style={styles.xWrap}>
        <View style={[styles.xLine, styles.xLine1]} />
        <View style={[styles.xLine, styles.xLine2]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  xWrap: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  xLine: {
    position: "absolute",
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#2D2D2D",
  },
  xLine1: {
    transform: [{ rotate: "45deg" }],
  },
  xLine2: {
    transform: [{ rotate: "-45deg" }],
  },
});
