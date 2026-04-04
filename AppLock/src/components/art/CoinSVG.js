import React from "react";
import Svg, { Circle, Text as SvgText, Defs, LinearGradient, Stop, Ellipse } from "react-native-svg";

// Piggy Coin — gold/pink coin with "P" embossed
export default function CoinSVG({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFD700" />
          <Stop offset="0.3" stopColor="#FFC000" />
          <Stop offset="0.6" stopColor="#FF69B4" />
          <Stop offset="1" stopColor="#FF45A0" />
        </LinearGradient>
        <LinearGradient id="coinShine" x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      <Ellipse cx="16" cy="28" rx="12" ry="3" fill="#000" opacity="0.1" />

      {/* Coin edge (3D effect) */}
      <Circle cx="16" cy="17" r="14" fill="#CC8800" />

      {/* Coin face */}
      <Circle cx="16" cy="16" r="14" fill="url(#coinGrad)" />

      {/* Inner ring */}
      <Circle cx="16" cy="16" r="11" fill="none" stroke="#FFE44D" strokeWidth="1" opacity="0.6" />

      {/* P emblem */}
      <SvgText
        x="16"
        y="22"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill="#FFFFFF"
        opacity="0.95"
      >
        P
      </SvgText>

      {/* Shine highlight */}
      <Ellipse cx="11" cy="11" rx="6" ry="5" fill="url(#coinShine)" />
    </Svg>
  );
}
