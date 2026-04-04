import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse, G, Rect } from "react-native-svg";

// Massive godlike hand descending from above — holding/pouring slop
export default function GodHandSVG({ size = 120 }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 120 144">
      <Defs>
        <LinearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE0C8" />
          <Stop offset="0.5" stopColor="#F5C8A8" />
          <Stop offset="1" stopColor="#E8B090" />
        </LinearGradient>
        <LinearGradient id="sleevGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2C2C2C" />
          <Stop offset="1" stopColor="#1A1A1A" />
        </LinearGradient>
        <LinearGradient id="nailGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE8E8" />
          <Stop offset="1" stopColor="#F0C8C8" />
        </LinearGradient>
        <LinearGradient id="slopDrip" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8CA040" />
          <Stop offset="1" stopColor="#6B8830" />
        </LinearGradient>
      </Defs>

      {/* Dark sleeve / arm coming from above */}
      <Path
        d="M30,0 L90,0 L88,40 Q88,48 82,50 L38,50 Q32,48 32,40 Z"
        fill="url(#sleevGrad)"
      />
      {/* Sleeve cuff */}
      <Rect x="28" y="44" width="64" height="10" rx="5" fill="#3A3A3A" />
      <Path d="M32,49 L88,49" stroke="#555" strokeWidth="0.8" />

      {/* Palm */}
      <Path
        d="M26,54 Q24,50 30,48 L90,48 Q96,50 94,54 L92,90 Q90,100 80,104 L40,104 Q30,100 28,90 Z"
        fill="url(#skinGrad)"
      />

      {/* Knuckle wrinkles */}
      <Path d="M38,60 Q44,58 50,60" stroke="#D8A888" strokeWidth="0.8" fill="none" />
      <Path d="M55,59 Q62,57 68,59" stroke="#D8A888" strokeWidth="0.8" fill="none" />
      <Path d="M72,60 Q78,58 84,60" stroke="#D8A888" strokeWidth="0.8" fill="none" />

      {/* Fingers — curled inward, cupping */}
      {/* Index */}
      <Path
        d="M32,92 Q28,100 30,112 Q32,120 38,122 Q44,120 44,112 L44,94"
        fill="url(#skinGrad)"
        stroke="#D8A888"
        strokeWidth="0.5"
      />
      <Ellipse cx="35" cy="122" rx="5" ry="4" fill="url(#nailGrad)" />

      {/* Middle */}
      <Path
        d="M46,94 Q42,104 44,118 Q46,128 52,130 Q58,128 58,118 L58,94"
        fill="url(#skinGrad)"
        stroke="#D8A888"
        strokeWidth="0.5"
      />
      <Ellipse cx="51" cy="130" rx="5" ry="4" fill="url(#nailGrad)" />

      {/* Ring */}
      <Path
        d="M62,94 Q58,104 60,118 Q62,128 68,130 Q74,128 74,118 L74,94"
        fill="url(#skinGrad)"
        stroke="#D8A888"
        strokeWidth="0.5"
      />
      <Ellipse cx="67" cy="130" rx="5" ry="4" fill="url(#nailGrad)" />

      {/* Pinky */}
      <Path
        d="M78,92 Q76,100 78,110 Q80,118 84,118 Q88,116 88,110 L86,92"
        fill="url(#skinGrad)"
        stroke="#D8A888"
        strokeWidth="0.5"
      />
      <Ellipse cx="83" cy="118" rx="4" ry="3.5" fill="url(#nailGrad)" />

      {/* Thumb — to the side */}
      <Path
        d="M24,58 Q18,62 16,72 Q14,82 18,88 Q24,92 28,88 L30,68"
        fill="url(#skinGrad)"
        stroke="#D8A888"
        strokeWidth="0.5"
      />
      <Ellipse cx="20" cy="88" rx="5" ry="4" fill="url(#nailGrad)" />

      {/* Slop dripping from fingers */}
      <G opacity="0.8">
        <Path d="M36,122 Q35,130 36,138" stroke="url(#slopDrip)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Ellipse cx="36" cy="140" rx="3" ry="2" fill="#8CA040" />

        <Path d="M52,130 Q51,136 52,142" stroke="url(#slopDrip)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Ellipse cx="52" cy="144" rx="2.5" ry="1.5" fill="#7A9835" />

        <Path d="M68,130 Q67,135 68,140" stroke="url(#slopDrip)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  );
}
