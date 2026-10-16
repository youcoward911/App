import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center}</style>
</head><body>
<svg viewBox="0 0 100 90" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- ear -->
  <ellipse cx="28" cy="20" rx="12" ry="14" fill="#F0A8B8" transform="rotate(-10,28,20)"/>
  <ellipse cx="28" cy="20" rx="7" ry="9" fill="#E890A4" transform="rotate(-10,28,20)"/>
  <!-- body -->
  <ellipse cx="50" cy="50" rx="36" ry="30" fill="#F5BCC8"/>
  <!-- coin slot -->
  <rect x="40" y="22" width="16" height="4" rx="2" fill="#D4899E"/>
  <!-- eye -->
  <circle cx="32" cy="44" r="3" fill="#5A3050"/>
  <!-- snout -->
  <ellipse cx="78" cy="52" rx="12" ry="10" fill="#EDA8B8"/>
  <circle cx="74" cy="51" r="2.2" fill="#D4899E"/>
  <circle cx="81" cy="51" r="2.2" fill="#D4899E"/>
  <!-- legs -->
  <rect x="26" y="74" width="10" height="10" rx="3" fill="#F5BCC8"/>
  <rect x="58" y="74" width="10" height="10" rx="3" fill="#F5BCC8"/>
  <!-- tail -->
  <path d="M14,48 Q8,40 12,34" fill="none" stroke="#F0A8B8" stroke-width="3" stroke-linecap="round"/>
</svg>
</body></html>`;

export default function PiggyBankIcon({ size = 40 }) {
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <WebView
        source={{ html: HTML }}
        style={styles.wv}
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wv: { flex: 1, backgroundColor: "transparent" },
});
