import React, { useRef, useCallback } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { WebView } from "react-native-webview";
import { mediumTap } from "../utils/haptics";
import { buildPigSkinHTML } from "../data/pigSkinHTML";

export default function PigIdleWebView({ level = 1, size = 224, skin = "default", centered = false, bgColor = null, idleMessages = null }) {
  const webRef = useRef(null);

  const handleTap = useCallback(() => {
    mediumTap();
    if (webRef.current) {
      webRef.current.injectJavaScript("pokePig(); true;");
    }
  }, []);

  // The WebView needs to be larger than the layout size so
  // bounce animations and shadows don't clip. We use absolute
  // positioning centered on the layout box so there's no margin shift.
  const pad = 80;
  const wvSize = size + pad * 2;

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ width: size, height: size, overflow: "visible" }}>
        <View style={{
          position: "absolute",
          left: -pad,
          top: -pad,
          width: wvSize,
          height: wvSize,
        }}>
          <WebView
            ref={webRef}
            source={{ html: buildPigSkinHTML(skin, Math.max(1, Math.min(level, 5)), size, centered, idleMessages) }}
            style={styles.webview}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            originWhitelist={["*"]}
            allowsInlineMediaPlayback={true}
            opaque={false}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

var styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
