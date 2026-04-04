import React from "react";
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";

// Open wallet tipping coins — leather brown with gold clasp
export default function WalletSVG({ size = 80 }) {
  const s = size / 80;
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 80 72">
      {/* Wallet body */}
      <Defs>
        <LinearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8B5E3C" />
          <Stop offset="0.5" stopColor="#6B3F1F" />
          <Stop offset="1" stopColor="#4A2510" />
        </LinearGradient>
        <LinearGradient id="walletInner" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D4A574" />
          <Stop offset="1" stopColor="#B8864E" />
        </LinearGradient>
        <LinearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9B6E4C" />
          <Stop offset="1" stopColor="#7B4E2C" />
        </LinearGradient>
      </Defs>

      {/* Inner lining visible at top */}
      <Rect x="12" y="8" width="56" height="30" rx="6" fill="url(#walletInner)" />

      {/* Main body */}
      <Path
        d="M8,28 Q8,18 18,18 L62,18 Q72,18 72,28 L72,60 Q72,68 62,68 L18,68 Q8,68 8,60 Z"
        fill="url(#walletGrad)"
      />

      {/* Stitching detail */}
      <Path
        d="M14,24 L66,24"
        stroke="#A0774C"
        strokeWidth="1"
        strokeDasharray="3,2"
        fill="none"
      />
      <Path
        d="M14,62 L66,62"
        stroke="#5A3318"
        strokeWidth="1"
        strokeDasharray="3,2"
        fill="none"
      />

      {/* Card pocket visible */}
      <Rect x="16" y="30" width="24" height="16" rx="3" fill="#5A3318" opacity="0.4" />

      {/* Flap (open) */}
      <Path
        d="M14,20 Q14,8 26,6 L54,6 Q66,8 66,20"
        fill="url(#flapGrad)"
        stroke="#6B3F1F"
        strokeWidth="1"
      />

      {/* Gold clasp */}
      <Circle cx="40" cy="18" r="5" fill="#FFD700" />
      <Circle cx="40" cy="18" r="3" fill="#FFC000" />
      <Circle cx="40" cy="18" r="1.5" fill="#FFE44D" />

      {/* Bills peeking out */}
      <Rect x="20" y="10" width="18" height="10" rx="2" fill="#85BB65" opacity="0.7" />
      <Rect x="42" y="12" width="16" height="8" rx="2" fill="#6BA352" opacity="0.6" />
    </Svg>
  );
}
