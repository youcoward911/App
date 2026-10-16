import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";

const FIGMA_HOME = require("../../assets/home-screen-figma.png");
const { width: W, height: H } = Dimensions.get("window");

export default function DesignLabScreen() {
  return (
    <View style={styles.container}>
      <Image source={FIGMA_HOME} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAE4E8", alignItems: "center", justifyContent: "center" },
  image: { width: W, height: H },
});
