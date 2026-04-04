import React from "react";
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop, G } from "react-native-svg";

// Slop splash — particles bursting outward when slop hits trough
export default function SlopSplashSVG({ size = 100 }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 100 60">
      <Defs>
        <LinearGradient id="splashGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B8D060" />
          <Stop offset="1" stopColor="#6B8830" />
        </LinearGradient>
      </Defs>

      {/* Center splash impact */}
      <Ellipse cx="50" cy="40" rx="20" ry="8" fill="#8CA040" opacity="0.5" />

      {/* Splash droplets flying outward */}
      {/* Left splashes */}
      <Path d="M30,35 Q22,20 18,28" stroke="#8CA040" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Ellipse cx="16" cy="30" rx="4" ry="3" fill="#8CA040" opacity="0.8" />

      <Path d="M35,30 Q28,12 20,18" stroke="#A0B848" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Ellipse cx="18" cy="18" rx="3" ry="2.5" fill="#A0B848" opacity="0.7" />

      <Path d="M25,38 Q14,30 10,36" stroke="#7A9835" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Ellipse cx="8" cy="38" rx="3" ry="2" fill="#7A9835" opacity="0.6" />

      {/* Right splashes */}
      <Path d="M70,35 Q78,20 82,28" stroke="#8CA040" strokeWidth="3" strokeLinecap="round" fill="none" />
      <Ellipse cx="84" cy="30" rx="4" ry="3" fill="#8CA040" opacity="0.8" />

      <Path d="M65,30 Q72,12 80,18" stroke="#A0B848" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Ellipse cx="82" cy="18" rx="3" ry="2.5" fill="#A0B848" opacity="0.7" />

      <Path d="M75,38 Q86,30 90,36" stroke="#7A9835" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Ellipse cx="92" cy="38" rx="3" ry="2" fill="#7A9835" opacity="0.6" />

      {/* Top splashes */}
      <Ellipse cx="42" cy="8" rx="3" ry="3" fill="#B8D060" opacity="0.6" />
      <Ellipse cx="58" cy="5" rx="2.5" ry="2.5" fill="#A0B848" opacity="0.5" />
      <Ellipse cx="50" cy="12" rx="2" ry="2" fill="#8CA040" opacity="0.7" />
    </Svg>
  );
}
