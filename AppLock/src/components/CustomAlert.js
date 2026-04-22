import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { C, T } from "../utils/theme";
import { warningTap, lightTap } from "../utils/haptics";

const { width: SCREEN_W } = Dimensions.get("window");

let globalShow = null;

export function showAlert(title, body, buttons) {
  if (globalShow) globalShow(title, body, buttons);
}

export default function CustomAlert() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [buttons, setButtons] = useState([]);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((t, b, btns) => {
    setTitle(t || "");
    setBody(b || "");
    setButtons(btns || [{ text: "OK" }]);
    setVisible(true);
    scale.setValue(0.85);
    opacity.setValue(0);
    warningTap();
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    globalShow = show;
    return () => { globalShow = null; };
  }, [show]);

  const dismiss = (callback) => {
    lightTap();
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.85, duration: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      if (callback) callback();
    });
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {body ? <Text style={styles.body}>{body}</Text> : null}
          <View style={styles.btnRow}>
            {buttons.map((btn, i) => {
              const isCancel = btn.style === "cancel";
              const isLast = i === buttons.length - 1 && !isCancel;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    isLast && styles.btnPrimary,
                    isCancel && styles.btnCancel,
                    buttons.length === 1 && styles.btnFull,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => dismiss(btn.onPress)}
                >
                  <Text style={[
                    styles.btnText,
                    isLast && styles.btnTextPrimary,
                    isCancel && styles.btnTextCancel,
                  ]}>
                    {btn.text || "OK"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: SCREEN_W - 64,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 20,
    shadowColor: C.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: C.pinkPale,
  },
  btnPrimary: {
    backgroundColor: C.pink,
  },
  btnCancel: {
    backgroundColor: "#F0F0F0",
  },
  btnFull: {
    backgroundColor: C.pink,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.pink,
  },
  btnTextPrimary: {
    color: "#FFF",
  },
  btnTextCancel: {
    color: C.textSecondary,
  },
});
