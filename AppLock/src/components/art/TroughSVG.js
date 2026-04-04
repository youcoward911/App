import React from "react";
import Svg, { Path, Rect, Defs, LinearGradient, Stop, Ellipse, G } from "react-native-svg";

// Wooden feeding trough — rustic with slop option
export default function TroughSVG({ size = 160, showSlop = false, slopLevel = 0 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 160 88">
      <Defs>
        <LinearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C8904E" />
          <Stop offset="0.4" stopColor="#A06830" />
          <Stop offset="1" stopColor="#7A4820" />
        </LinearGradient>
        <LinearGradient id="woodSide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8B5E3C" />
          <Stop offset="1" stopColor="#6B3F1F" />
        </LinearGradient>
        <LinearGradient id="slopGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A8B860" />
          <Stop offset="0.3" stopColor="#8CA040" />
          <Stop offset="0.7" stopColor="#6B8830" />
          <Stop offset="1" stopColor="#556B28" />
        </LinearGradient>
        <LinearGradient id="slopShine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#C8D870" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#8CA040" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      <Ellipse cx="80" cy="84" rx="65" ry="4" fill="#000" opacity="0.12" />

      {/* Trough body — trapezoidal */}
      <Path
        d="M18,30 L10,78 Q10,82 16,82 L144,82 Q150,82 150,78 L142,30 Z"
        fill="url(#woodGrad)"
      />

      {/* Wood grain lines */}
      <Path d="M30,35 L24,75" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.4" />
      <Path d="M55,35 L50,75" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.3" />
      <Path d="M80,35 L78,75" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.4" />
      <Path d="M105,35 L108,75" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.3" />
      <Path d="M130,35 L136,75" stroke="#8B5E3C" strokeWidth="0.8" opacity="0.4" />

      {/* Rim — thick top edge */}
      <Path
        d="M14,26 Q14,22 20,22 L140,22 Q146,22 146,26 L142,34 L18,34 Z"
        fill="#B8804A"
      />
      <Path
        d="M16,24 Q16,20 22,20 L138,20 Q144,20 144,24 L140,30 L20,30 Z"
        fill="url(#woodGrad)"
        stroke="#9B6E3C"
        strokeWidth="0.5"
      />

      {/* Metal bands */}
      <Path d="M20,45 L140,45" stroke="#888" strokeWidth="2.5" opacity="0.5" />
      <Path d="M16,65 L144,65" stroke="#888" strokeWidth="2.5" opacity="0.5" />

      {/* Rivets */}
      <Ellipse cx="28" cy="45" rx="2.5" ry="2.5" fill="#999" opacity="0.6" />
      <Ellipse cx="132" cy="45" rx="2.5" ry="2.5" fill="#999" opacity="0.6" />
      <Ellipse cx="24" cy="65" rx="2.5" ry="2.5" fill="#999" opacity="0.6" />
      <Ellipse cx="136" cy="65" rx="2.5" ry="2.5" fill="#999" opacity="0.6" />

      {/* Legs */}
      <Rect x="22" y="78" width="8" height="8" rx="2" fill="#6B3F1F" />
      <Rect x="130" y="78" width="8" height="8" rx="2" fill="#6B3F1F" />

      {/* Slop inside trough */}
      {showSlop && (
        <G opacity={Math.min(1, slopLevel)}>
          {/* Main slop body */}
          <Path
            d="M24,38 Q40,32 80,34 Q120,32 136,38 L134,72 Q120,76 80,74 Q40,76 26,72 Z"
            fill="url(#slopGrad)"
          />
          {/* Slop surface shine */}
          <Ellipse cx="80" cy="40" rx="50" ry="8" fill="url(#slopShine)" />
          {/* Chunky bits */}
          <Ellipse cx="50" cy="50" rx="6" ry="4" fill="#7A9835" opacity="0.7" />
          <Ellipse cx="95" cy="48" rx="5" ry="3" fill="#6B8830" opacity="0.6" />
          <Ellipse cx="70" cy="58" rx="7" ry="4" fill="#8CA040" opacity="0.5" />
          <Ellipse cx="110" cy="55" rx="4" ry="3" fill="#7A9835" opacity="0.6" />
          {/* Bubble */}
          <Ellipse cx="65" cy="42" rx="3" ry="2.5" fill="#B8D060" opacity="0.5" />
          <Ellipse cx="100" cy="44" rx="2" ry="1.5" fill="#C8E070" opacity="0.4" />
        </G>
      )}
    </Svg>
  );
}
