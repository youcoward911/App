// Pig evolution — 10 tiers based on totalCoinsSpent.
// First coin spent = instant level up (tier 1 at just 1 coin).

export const WEIGHT_TIERS = [
  { key: "starving",    label: "Starving",     minCoins: 0,    scale: 0.70, emoji: "💀" },
  { key: "bony",        label: "Bony",         minCoins: 1,    scale: 0.78, emoji: "🦴" },
  { key: "scrawny",     label: "Scrawny",      minCoins: 20,   scale: 0.86, emoji: "🐽" },
  { key: "lean",        label: "Lean",         minCoins: 60,   scale: 0.94, emoji: "🐷" },
  { key: "average",     label: "Average",      minCoins: 100,  scale: 1.0,  emoji: "🐖" },
  { key: "plump",       label: "Plump",        minCoins: 200,  scale: 1.08, emoji: "🍕" },
  { key: "chubby",      label: "Chubby",       minCoins: 400,  scale: 1.16, emoji: "🍔" },
  { key: "fat",         label: "Fat",          minCoins: 600,  scale: 1.24, emoji: "🐽" },
  { key: "obese",       label: "Obese",        minCoins: 1000, scale: 1.34, emoji: "🏆" },
  { key: "massive",     label: "Massive",      minCoins: 2000, scale: 1.45, emoji: "👑" },
];

// Threshold for the secret 11th — just in case
const LEGENDARY_COINS = 5000;

export function getPigWeight(totalCoinsSpent) {
  let tier = WEIGHT_TIERS[0];
  for (const t of WEIGHT_TIERS) {
    if (totalCoinsSpent >= t.minCoins) tier = t;
  }
  // Legendary override
  if (totalCoinsSpent >= LEGENDARY_COINS) {
    return { ...WEIGHT_TIERS[WEIGHT_TIERS.length - 1], label: "Legendary", emoji: "👑", key: "legendary" };
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

// Speech bubble messages per weight tier — cycled every ~30s
export const PIG_SPEECH = {
  starving: [
    "So hungry...",
    "Feed me... please...",
    "Wasting away here...",
    "Need slop... dying...",
    "Is anyone there...?",
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
