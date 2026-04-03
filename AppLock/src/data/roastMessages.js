// All messages — condescending, no emojis, no AI-speak

export const IMMEDIATE_ROASTS = [
  "Oh look, the little addict is back.",
  "Couldn't help yourself could you? Pathetic.",
  "Does the little piggy need their phone?",
  "You're so predictable it's actually embarrassing.",
  "There it is. That sad little urge you can't control.",
  "God you're weak. Like, genuinely weak.",
  "You really are a slave to this thing.",
  "I knew you'd be back. You always come back.",
  "Not even a fight. Just instant surrender.",
  "Look at you. Crawling back like a good little piggy.",
  "The phone rang and you came running. Trained perfectly.",
  "Another day, another moment of total spinelessness.",
];

export const TIME_BASED_ROASTS = [
  {
    maxMinutes: 5,
    messages: [
      "{minutes} minutes. That's genuinely humiliating.",
      "It's been {minutes} minutes. You absolute slave.",
      "{minutes} minutes and you're already begging? Jesus.",
      "Not even {minutes} minutes. Zero control.",
      "{minutes} minutes. A toddler has more discipline than you.",
      "Couldn't make it {minutes} minutes. Record-breaking weakness.",
    ],
  },
  {
    maxMinutes: 15,
    messages: [
      "{minutes} minutes. Want a medal for bare minimum?",
      "{minutes} minutes before crawling back. Your phone trained you well.",
      "Managed {minutes} whole minutes. Still embarrassing.",
    ],
  },
  {
    maxMinutes: 30,
    messages: [
      "{minutes} minutes and you still couldn't resist. Owned by a screen.",
      "Made it {minutes} whole minutes before giving in like the obedient little addict you are.",
    ],
  },
  {
    maxMinutes: 60,
    messages: [
      "{minutes} minutes? Almost impressive. But here you are, wallet out, dignity gone.",
      "Lasted {minutes} minutes and still ended up here. The phone always wins.",
    ],
  },
  {
    maxMinutes: Infinity,
    messages: [
      "{minutes} minutes of pretending you don't need it. But we both know who's in charge here.",
      "You lasted {minutes} minutes and you're STILL giving in? All that willpower for nothing.",
    ],
  },
];

export const REPEAT_OFFENDER_ROASTS = [
  {
    maxUnlocks: 3,
    messages: [
      "That's number {count} today. You keeping score or should I?",
      "Unlock {count}. The phone has you completely trained.",
      "Number {count} today. Good piggy. Very obedient.",
    ],
  },
  {
    maxUnlocks: 6,
    messages: [
      "UNLOCK {count}. You're not a user, you're a servant.",
      "{count} unlocks. You are genuinely owned by this device.",
      "{count} times today and still paying. Actually sad.",
    ],
  },
  {
    maxUnlocks: Infinity,
    messages: [
      "Number {count}. I don't even have words anymore. Just oinks.",
      "{count} TIMES TODAY. You should be ashamed. Profoundly.",
      "Number {count}. You're not even a PayPig anymore. You're just a pig.",
      "{count} unlocks. Completely, utterly, hopelessly owned.",
    ],
  },
];

export const PRE_PAYMENT_TAUNTS = [
  "Open that wallet, piggy. You know the drill.",
  "Time to pay up, addict. Your phone is waiting.",
  "Go on then. Pay the coins like a good little slave.",
  "Your phone says jump, you ask how many coins.",
  "You'd literally rather spend coins than have self-control. Think about that.",
  "Imagine being so owned by a device that you PAY it to use it. That's you.",
  "Get your coins out. Your master is waiting.",
  "The phone owns you. The app owns you. Now pay up.",
];

export const POST_UNLOCK_SHADE = [
  "There you go, piggy. Oink oink.",
  "Unlocked. Go get your fix. I'll be here when you crawl back.",
  "Good pig. Now go scroll mindlessly like the trained animal you are.",
  "Enjoy your slop. See you in 5 minutes when you pretend you've changed.",
  "Unlocked. Your phone thanks you for your servitude.",
  "You just paid to be a slave. Again.",
  "Hope it was worth your coins AND your dignity.",
];

export function getRoastMessage(minutesSinceLock, unlockCountToday) {
  const messages = [];
  messages.push(pickRandom(IMMEDIATE_ROASTS));

  const timeBucket = TIME_BASED_ROASTS.find(
    (b) => minutesSinceLock < b.maxMinutes
  );
  if (timeBucket) {
    messages.push(
      pickRandom(timeBucket.messages).replace(
        "{minutes}",
        Math.floor(minutesSinceLock)
      )
    );
  }

  if (unlockCountToday >= 2) {
    const repeatBucket = REPEAT_OFFENDER_ROASTS.find(
      (b) => unlockCountToday <= b.maxUnlocks
    );
    if (repeatBucket) {
      messages.push(
        pickRandom(repeatBucket.messages).replace("{count}", unlockCountToday)
      );
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
