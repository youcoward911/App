// Roast messages — condescending, degrading, dom energy
// The user is a pathetic phone slave and PayPig knows it

export const IMMEDIATE_ROASTS = [
  "Oh look, the little addict is back.",
  "Couldn't help yourself could you? Pathetic.",
  "Aww, does the little piggy need their phone? 🐽",
  "You're so predictable it's actually embarrassing.",
  "There it is. That sad little urge you can't control.",
  "God you're weak. Like, genuinely weak.",
  "You really are a slave to this thing aren't you.",
  "I knew you'd be back. You always come back.",
  "Wow. Not even a fight. Just instant surrender.",
  "Look at you. Crawling back like a good little piggy.",
];

export const TIME_BASED_ROASTS = [
  // Under 5 minutes
  {
    maxMinutes: 5,
    messages: [
      "{minutes} minutes. That's genuinely humiliating for you.",
      "It's been {minutes} minutes lmao you absolute slave 💀",
      "{minutes} minutes and you're already begging? Jesus.",
      "Not even {minutes} minutes. You have zero control over yourself.",
      "{minutes} minutes 😭 you couldn't last {minutes} minutes without your precious phone",
      "Bro. {minutes} minutes. A toddler has more discipline than you.",
    ],
  },
  // 5-15 minutes
  {
    maxMinutes: 15,
    messages: [
      "{minutes} minutes. Wow, want a medal for bare minimum? 🏆",
      "Oh cool {minutes} minutes. Still embarrassing but slightly less pathetic.",
      "{minutes} minutes before crawling back. Your owner would be proud. Oh wait, that's your phone.",
    ],
  },
  // 15-30 minutes
  {
    maxMinutes: 30,
    messages: [
      "{minutes} minutes and you still couldn't resist. You really are owned by a screen.",
      "Made it {minutes} whole minutes before giving in like the obedient little addict you are.",
    ],
  },
  // 30-60 minutes
  {
    maxMinutes: 60,
    messages: [
      "{minutes} minutes? Almost impressive. Almost. But here you are, wallet out, dignity gone.",
      "Lasted {minutes} minutes and still ended up here. The phone always wins. You never do.",
    ],
  },
  // Over an hour
  {
    maxMinutes: Infinity,
    messages: [
      "{minutes} minutes of pretending you don't need it. But we both know who's in charge here. Hint: it's not you.",
      "You lasted {minutes} minutes and you're STILL giving in? All that willpower for nothing. Classic.",
    ],
  },
];

export const REPEAT_OFFENDER_ROASTS = [
  // Unlocked 2-3 times today
  {
    maxUnlocks: 3,
    messages: [
      "That's #{count} today. You know that right? You can count that high?",
      "Unlock #{count}. The phone has you completely trained.",
      "#{count} times today. Good piggy. Very obedient. 🐷",
    ],
  },
  // 4-6 times
  {
    maxUnlocks: 6,
    messages: [
      "UNLOCK #{count}. At this point you're not a user, you're a servant.",
      "{count} unlocks. {count}. You are genuinely owned by this device.",
      "{count} times today and still paying. This is just sad now. Like actually sad.",
    ],
  },
  // 7+ times
  {
    maxUnlocks: Infinity,
    messages: [
      "#{count}. I don't even have words anymore. Just oinks. 🐽",
      "{count} TIMES TODAY. You should be ashamed. Like deeply, profoundly ashamed.",
      "#{count}. At this point you're not even a PayPig. You're just a pig.",
      "{count} unlocks. You are completely, utterly, hopelessly owned by your phone. And you'll pay again tomorrow.",
    ],
  },
];

export const PRE_PAYMENT_TAUNTS = [
  "Open that wallet, piggy. You know the drill.",
  "Time to pay up, addict. Your phone is waiting.",
  "Go on then. Pay the fee like a good little slave.",
  "Your phone says jump, you say 'how much?' Pathetic. 💸",
  "You'd literally rather pay money than have self-control. Think about that.",
  "Imagine being so owned by a device that you PAY it to use it. That's you. That's what you are.",
  "Get your money out. Your master is waiting. 📱",
  "The phone owns you. The app owns you. Now pay up.",
];

export const POST_UNLOCK_SHADE = [
  "There you go, piggy. Oink oink. 🐽",
  "Unlocked. Go get your fix, addict. I'll be here when you crawl back.",
  "Good pig. Now go scroll mindlessly like the trained animal you are.",
  "Enjoy your slop. See you in 5 minutes when you lock it again pretending you've changed.",
  "Unlocked. Your phone thanks you for your servitude.",
  "Congrats. You just paid to be a slave. Again.",
  "Hope it was worth your money AND your dignity. Spoiler: it wasn't.",
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
