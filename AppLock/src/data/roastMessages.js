// Roast messages that escalate based on how quickly the user tries to unlock
// and how many times they've unlocked today

export const IMMEDIATE_ROASTS = [
  "What's the matter? Need to scroll that bad? 😏",
  "Awww does someone have no self control? 🥺",
  "Oh wow, that lasted long. Real impressive.",
  "Back already? That's genuinely sad.",
  "You literally JUST locked this. Pathetic.",
  "Couldn't even make it 5 minutes huh?",
  "Your willpower is... inspiring. Said no one ever.",
  "Wow. Just... wow. You're really doing this right now?",
];

export const TIME_BASED_ROASTS = [
  // Under 5 minutes
  {
    maxMinutes: 5,
    messages: [
      "It's been like {minutes} minutes lmao 💀",
      "Jesus Christ it's been like {minutes} minutes lmao",
      "{minutes} minutes. That's all you lasted. Let that sink in.",
      "Not even {minutes} minutes?? Are you serious right now?",
      "Bro it hasn't even been {minutes} minutes 😭",
    ],
  },
  // 5-15 minutes
  {
    maxMinutes: 15,
    messages: [
      "Okay {minutes} minutes isn't terrible... but it's not good either.",
      "{minutes} whole minutes! Want a trophy? 🏆",
      "I mean... {minutes} minutes is technically progress I guess?",
    ],
  },
  // 15-30 minutes
  {
    maxMinutes: 30,
    messages: [
      "{minutes} minutes. Not bad, not great. Mediocre, just like your self-control.",
      "Look at you making it {minutes} minutes! Your parents would be so... okay with that.",
    ],
  },
  // 30-60 minutes
  {
    maxMinutes: 60,
    messages: [
      "{minutes} minutes? Okay that's actually decent. But you're still here aren't you?",
      "Made it {minutes} minutes and still crawled back. Classic you.",
    ],
  },
  // Over an hour
  {
    maxMinutes: Infinity,
    messages: [
      "Okay {minutes} minutes is actually impressive. But the fact that you're unlocking now ruins it.",
      "You lasted {minutes} minutes and you're STILL giving in? After all that effort?",
    ],
  },
];

export const REPEAT_OFFENDER_ROASTS = [
  // Unlocked 2-3 times today
  {
    maxUnlocks: 3,
    messages: [
      "This is unlock #{count} today btw. Just so you know.",
      "Unlock #{count}. I'm not judging. Okay I'm definitely judging.",
      "That's {count} times today. You're really speedrunning failure.",
    ],
  },
  // 4-6 times
  {
    maxUnlocks: 6,
    messages: [
      "UNLOCK #{count} TODAY. Do you even hear yourself?",
      "{count} unlocks today. At this point just delete me, clearly I'm not helping.",
      "Babe. {count} times. Today alone. We need to talk.",
    ],
  },
  // 7+ times
  {
    maxUnlocks: Infinity,
    messages: [
      "#{count}. I've genuinely lost respect for you.",
      "{count} TIMES TODAY. You are beyond help and I am beyond caring.",
      "Unlock #{count}. I'm not even roasting you anymore this is just sad.",
      "At {count} unlocks you should probably just uninstall me. We both know this isn't working.",
    ],
  },
];

export const PRE_PAYMENT_TAUNTS = [
  "Really gonna waste money on this? Okay then...",
  "You're literally paying to prove you have no willpower 💸",
  "This money could've gone to literally anything else.",
  "Go ahead. Pay the fee. Feed the shame cycle. 🔄",
  "Your wallet called. It's also disappointed in you.",
  "Imagine explaining this charge to someone. 'Oh I paid to unlock Instagram because I'm weak.'",
  "Fine. Get your card out, addict.",
  "The fact that you'd rather PAY than just... not use the app... says everything.",
];

export const POST_UNLOCK_SHADE = [
  "There you go. Was it worth it? (It wasn't.)",
  "Unlocked. Enjoy your dopamine hit, you absolute gremlin.",
  "Fine. Go scroll. I'll be here when you inevitably come crawling back.",
  "Congrats on your purchase of temporary happiness and permanent shame.",
  "Unlocked for now. Timer's ticking on your next moment of weakness.",
  "Hope those memes are worth your dignity. Spoiler: they're not.",
];

/**
 * Get a random roast message based on context
 */
export function getRoastMessage(minutesSinceLock, unlockCountToday) {
  const messages = [];

  // Always include an immediate roast
  messages.push(pickRandom(IMMEDIATE_ROASTS));

  // Add time-based roast
  const timeBucket = TIME_BASED_ROASTS.find(
    (b) => minutesSinceLock < b.maxMinutes
  );
  if (timeBucket) {
    const msg = pickRandom(timeBucket.messages).replace(
      "{minutes}",
      Math.floor(minutesSinceLock)
    );
    messages.push(msg);
  }

  // Add repeat offender roast if applicable
  if (unlockCountToday >= 2) {
    const repeatBucket = REPEAT_OFFENDER_ROASTS.find(
      (b) => unlockCountToday <= b.maxUnlocks
    );
    if (repeatBucket) {
      const msg = pickRandom(repeatBucket.messages).replace(
        "{count}",
        unlockCountToday
      );
      messages.push(msg);
    }
  }

  return messages;
}

export function getPrePaymentTaunt() {
  return pickRandom(PRE_PAYMENT_TAUNTS);
}

export function getPostUnlockShade() {
  return pickRandom(POST_UNLOCK_SHADE);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
