// Pig evolution — 10 tiers based on totalCoinsSpent.
// First coin spent = instant level up (tier 1 at just 1 coin).

export const WEIGHT_TIERS = [
  { key: "starving",    label: "Starving",     minCoins: 0,    scale: 0.70 },
  { key: "bony",        label: "Bony",         minCoins: 1,    scale: 0.78 },
  { key: "scrawny",     label: "Scrawny",      minCoins: 20,   scale: 0.86 },
  { key: "lean",        label: "Lean",         minCoins: 60,   scale: 0.94 },
  { key: "average",     label: "Average",      minCoins: 100,  scale: 1.0 },
  { key: "plump",       label: "Plump",        minCoins: 200,  scale: 1.08 },
  { key: "chubby",      label: "Chubby",       minCoins: 400,  scale: 1.16 },
  { key: "fat",         label: "Fat",          minCoins: 600,  scale: 1.24 },
  { key: "obese",       label: "Obese",        minCoins: 1000, scale: 1.34 },
  { key: "massive",     label: "Massive",      minCoins: 2000, scale: 1.45 },
];

// Threshold for the secret 11th
const LEGENDARY_COINS = 5000;

export function getPigWeight(totalCoinsSpent) {
  let tier = WEIGHT_TIERS[0];
  for (const t of WEIGHT_TIERS) {
    if (totalCoinsSpent >= t.minCoins) tier = t;
  }
  // Legendary override
  if (totalCoinsSpent >= LEGENDARY_COINS) {
    return { ...WEIGHT_TIERS[WEIGHT_TIERS.length - 1], label: "Legendary", key: "legendary" };
  }
  return tier;
}

// Progress to next tier (0-1), or 1 if maxed
export function getWeightProgress(totalCoinsSpent) {
  if (totalCoinsSpent >= LEGENDARY_COINS) return 1;
  const current = getPigWeight(totalCoinsSpent);
  const idx = WEIGHT_TIERS.findIndex((t) => t.key === current.key);
  if (idx < 0 || idx >= WEIGHT_TIERS.length - 1) return 1;
  const next = WEIGHT_TIERS[idx + 1];
  const range = next.minCoins - current.minCoins;
  const progress = (totalCoinsSpent - current.minCoins) / range;
  return Math.min(1, Math.max(0, progress));
}

// ─── XP / LEVEL SYSTEM ───
// XP = totalCoinsSpent. Each level has an XP threshold and a pig tier name.
// The glass-break animation triggers when XP crosses a level boundary.

export const LEVELS = [
  { level: 1,  xpRequired: 0,     tier: "Runt",           skin: null },
  { level: 2,  xpRequired: 20,    tier: "Scrawny Pig",    skin: "pirate" },
  { level: 3,  xpRequired: 60,    tier: "Lean Pig",       skin: "baller" },
  { level: 4,  xpRequired: 120,   tier: "Chonky Pig",     skin: null },
  { level: 5,  xpRequired: 200,   tier: "Mega Hog",       skin: "ghost" },
  { level: 6,  xpRequired: 350,   tier: "Thicc Boar",     skin: null },
  { level: 7,  xpRequired: 550,   tier: "Absolute Unit",  skin: "zombie" },
  { level: 8,  xpRequired: 800,   tier: "Slop Lord",      skin: null },
  { level: 9,  xpRequired: 1100,  tier: "Hog God",        skin: "devil" },
  { level: 10, xpRequired: 1500,  tier: "Supreme Swine",  skin: null },
  { level: 11, xpRequired: 2000,  tier: "Elder Hog",      skin: null },
  { level: 12, xpRequired: 2800,  tier: "Overlord Pig",   skin: "punk" },
  { level: 13, xpRequired: 3800,  tier: "Mythic Boar",    skin: "cowboy" },
  { level: 14, xpRequired: 5000,  tier: "Pig Royale",     skin: "astro" },
  { level: 15, xpRequired: 7500,  tier: "LEGENDARY",      skin: "king" },
];

// Pig body size per level, shared by every pig renderer (skins are just a look on top).
// Compounds ~4.4% per level from 0.8 at Lv.1 to 1.45 at the top level, and gets
// slightly wider than tall as the pig fattens.
const PIG_SCALE_MIN = 0.8;
const PIG_SCALE_MAX = 1.45;
export function getPigScale(level) {
  const steps = LEVELS.length - 1;
  const l = Math.max(1, Math.min(level || 1, LEVELS.length));
  const size = PIG_SCALE_MIN * Math.pow(PIG_SCALE_MAX / PIG_SCALE_MIN, (l - 1) / steps);
  return { x: +(size * (1 + 0.008 * (l - 1))).toFixed(3), y: +size.toFixed(3) };
}

export function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) lvl = l;
  }
  return lvl;
}

export function getNextLevel(xp) {
  const current = getLevel(xp);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  if (idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function getLevelProgress(xp) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 1;
  const range = next.xpRequired - current.xpRequired;
  return Math.min(1, Math.max(0, (xp - current.xpRequired) / range));
}

export function getXPInLevel(xp) {
  const current = getLevel(xp);
  return xp - current.xpRequired;
}

export function getXPForLevel(xp) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 0;
  return next.xpRequired - current.xpRequired;
}

// Detect if a level-up just happened (oldXP was below threshold, newXP is at/above)
export function checkLevelUp(oldXP, newXP) {
  const oldLevel = getLevel(oldXP);
  const newLevel = getLevel(newXP);
  if (newLevel.level > oldLevel.level) {
    return { from: oldLevel, to: newLevel };
  }
  return null;
}

// ─── ACHIEVEMENTS ───

export const ACHIEVEMENT_DEFS = [
  { id: "first_lock",    name: "First Lock",     desc: "Lock your apps for the first time", icon: "🔒", check: (s) => s.totalUnlocks >= 1 || s.slopLock?.isLocked },
  { id: "hog_lord",      name: "Hog Lord",       desc: "Reach Level 5",                     icon: "👑", check: (s) => getLevel(s.totalCoinsSpent).level >= 5 },
  { id: "slop_master",   name: "Slop Master",    desc: "Reach a 12-day streak",             icon: "🔥", check: (s) => (s.ironSnoutStreak >= 12 || s.bestIronSnout >= 12) },
  { id: "glass_breaker", name: "Glass Breaker",  desc: "Level up for the first time",       icon: "💎", check: (s) => getLevel(s.totalCoinsSpent).level >= 2 },
  { id: "big_spender",   name: "Big Spender",    desc: "Spend 500 coins",                   icon: "💸", check: (s) => s.totalCoinsSpent >= 500 },
  { id: "iron_snout",    name: "Iron Snout",     desc: "Complete 5 locks without peeking",   icon: "🐽", check: (s) => s.bestIronSnout >= 5 },
  { id: "mega_hog",      name: "Mega Hog",       desc: "Reach Level 5",                     icon: "🐷", check: (s) => getLevel(s.totalCoinsSpent).level >= 5 },
  { id: "legendary",     name: "Legendary Pig",  desc: "Reach Level 10",                    icon: "⭐", check: (s) => getLevel(s.totalCoinsSpent).level >= 10 },
  { id: "surrender_10",  name: "Serial Surrenderer", desc: "Surrender 10 times",            icon: "🏳️", check: (s) => s.totalSurrenders >= 10 },
  { id: "peek_addict",   name: "Peek Addict",    desc: "Peek 20 times",                     icon: "👀", check: (s) => s.totalPeeks >= 20 },
];

export function getUnlockedAchievements(state) {
  return ACHIEVEMENT_DEFS.filter((a) => a.check(state));
}

export function getNewAchievements(oldState, newState) {
  const oldUnlocked = new Set(getUnlockedAchievements(oldState).map((a) => a.id));
  return getUnlockedAchievements(newState).filter((a) => !oldUnlocked.has(a.id));
}

// Speech bubble messages per weight tier — cycled every ~30s
export const PIG_SPEECH = {
  starving: [
    "So...hungry...",
    "Must...scroll...\nslop...",
  ],
  bony: [
    "A crumb! Finally!",
    "Still so hungry...",
    "More... need more...",
    "That barely helped...",
    "Begging for scraps...",
  ],
  scrawny: [
    "Getting a taste for slop...",
    "Hungry for more!",
    "Need more slop please!",
    "Feed me more!",
    "Starting to feel it...",
  ],
  lean: [
    "The slop is flowing!",
    "More slop, more!",
    "Getting stronger!",
    "Hungry for slop!",
    "Keep it coming!",
  ],
  average: [
    "Nom nom nom!",
    "The trough is calling!",
    "Begging for more delicious slop!",
    "Can't stop eating!",
    "Slop slop slop!",
  ],
  plump: [
    "Getting nice and plump!",
    "Look how round I'm getting!",
    "The slop is SO good!",
    "More! MORE!",
    "Filling out nicely!",
  ],
  chubby: [
    "Look at these cheeks!",
    "Can barely see my hooves!",
    "Sooo much slop!",
    "Absolutely stuffed!",
    "More room for slop!",
  ],
  fat: [
    "Look how full of yummy slop I am!",
    "The trough can't keep up!",
    "MASSIVE appetite!",
    "Rolling in slop!",
    "Who's a big pig?!",
  ],
  obese: [
    "UNSTOPPABLE!",
    "The slop king rises!",
    "Can't. Stop. Eating!",
    "Fear my girth!",
    "Oink oink OINK!",
  ],
  massive: [
    "BOW BEFORE ME!",
    "ABSOLUTE UNIT!",
    "The trough is MINE!",
    "LEGENDARY slop eater!",
    "None can match my size!",
  ],
  legendary: [
    "I AM THE TROUGH!",
    "GODLIKE!",
    "Beyond massive!",
    "The ultimate pig!",
    "They write legends about me!",
  ],
};
