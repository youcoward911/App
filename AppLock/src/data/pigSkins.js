// Pig skin definitions — unlock levels, rarity, and display info.
// The HTML for each skin is built in pigSkinHTML.js

export const PIG_SKINS = [
  {
    id: "default",
    name: "Scroll Pig",
    rarity: "common",
    rarityLabel: "Common",
    unlockLevel: 1,
    description: "Just a pig and its slop.",
    tagline: "OINK OINK",
  },
  {
    id: "pirate",
    name: "Cap'n Slop",
    rarity: "rare",
    rarityLabel: "Rare",
    unlockLevel: 2,
    description: "ARGH! FEED ME SLOP, LANDLUBBER!",
    tagline: "ARGH!",
  },
  {
    id: "baller",
    name: "Swish Pig",
    rarity: "rare",
    rarityLabel: "Rare",
    unlockLevel: 3,
    description: "Nothin' but net, baby.",
    tagline: "SWISH!",
  },
  {
    id: "ghost",
    name: "Oinktergeist",
    rarity: "epic",
    rarityLabel: "Epic",
    unlockLevel: 5,
    description: "Your screen time haunts me.",
    tagline: "BOO!",
  },
  {
    id: "zombie",
    name: "Zombacon",
    rarity: "epic",
    rarityLabel: "Epic",
    unlockLevel: 7,
    description: "SLOP BRAINS... NEED MORE SLOP...",
    tagline: "BRAAAINS...",
  },
  {
    id: "devil",
    name: "Deviled Ham",
    rarity: "epic",
    rarityLabel: "Epic",
    unlockLevel: 9,
    description: "Your soul? Nah. Your coins? Absolutely.",
    tagline: "MUAHAHA",
  },
  {
    id: "punk",
    name: "Pignose Punk",
    rarity: "legendary",
    rarityLabel: "Legendary",
    unlockLevel: 12,
    description: "Rules are for humans.",
    tagline: "OI! OI!",
  },
  {
    id: "cowboy",
    name: "Hog Wild",
    rarity: "legendary",
    rarityLabel: "Legendary",
    unlockLevel: 13,
    description: "This trough ain't big enough for the two of us.",
    tagline: "YEEHAW!",
  },
  {
    id: "astro",
    name: "Astro Pig",
    rarity: "legendary",
    rarityLabel: "Legendary",
    unlockLevel: 14,
    description: "One small oink for pig. One giant slop for pigkind.",
    tagline: "HOUSTON...",
  },
  {
    id: "king",
    name: "His Royal Hogness",
    rarity: "legendary",
    rarityLabel: "Legendary",
    unlockLevel: 15,
    description: "Bow before the trough.",
    tagline: "KNEEL!",
  },
];

export const RARITY_COLORS = {
  common: { bg: "rgba(255,255,255,.4)", text: "#8A423A" },
  rare: { bg: "#4A93D6", text: "#FFFFFF" },
  epic: { bg: "#9C6FE0", text: "#FFFFFF" },
  legendary: { bg: "#F0A93A", text: "#7E362E" },
};

export function getSkinById(id) {
  return PIG_SKINS.find((s) => s.id === id) || PIG_SKINS[0];
}

export function getUnlockedSkins(level) {
  return PIG_SKINS.filter((s) => level >= s.unlockLevel);
}

// Returns the skin that was just unlocked at this level, if any
export function getSkinUnlockedAtLevel(level) {
  return PIG_SKINS.find((s) => s.unlockLevel === level);
}
