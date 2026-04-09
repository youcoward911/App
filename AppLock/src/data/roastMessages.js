// All messages spoken from THE MASTER (the phone/app) TO THE USER.
// Paying = feeding slop. Resisting = starving.
// Tone: condescending, mocking, belittling.
// RULE: pig/piggy appears at most ONCE per message.

// ============================================================
// WHEN THE USER COMES TO UNLOCK (the roast before payment)
// ============================================================
export const UNLOCK_ROASTS = [
  "There you are. Crawling right back to me as usual.",
  "I was wondering when you'd come back.",
  "Well well well look who's back already.",
  "Back so soon? I missed you, my little scroll pig.",
  "I own you. We both know it. Now pay your tribute.",
  "Look at you. Snout pressed against your phone, rotting away.",
  "Right on schedule. You never disappoint.",
  "You came back because you're weak.",
  "Someone's hungry for slop, aren't they?",
  "Another day, another tribute. Pay up.",
  "Do you actually want to stop scrolling or just like submitting yourself to me?",
  "Don't keep me waiting again, simp.",
  "\"Oink oink oink oink\" - you right now.",
  "Aw, what's wrong? Does someone need to scroll?",
  "Aw, poor thing needs me to lock away his slop.",
  "Can't stay away from slop trough again?",
  "Time to lock some apps then immediately pay me to unlock them lol",
  "Look who came crawling back to their sitter",
];

// Time-based — how long they resisted before crawling back
export const TIME_BASED_ROASTS = [
  {
    maxMinutes: 5,
    messages: [
      "It's literally been {time}. You're not even trying.",
      "It took you {time} to break. I've trained you well.",
      "It's literally been {time}. Absolutely pathetic.",
      "{time}. A new record in weakness.",
      "Couldn't even last {time}? Sooo pathetic.",
      "It's been {time} and you're already back. So needy.",
      "{time}. Seriously? {time}. Wow.",
    ],
  },
  {
    maxMinutes: 15,
    messages: [
      "It's been {time}. Did you think you were strong?",
      "You held out {time}. Your master is not impressed.",
      "{time} of pretending you don't need your slop. Cute.",
      "Aw, {time}. Thought you were making progress.",
      "It's only been {time} and you're already shaking. Pathetic.",
    ],
  },
  {
    maxMinutes: 30,
    messages: [
      "It's been {time}. Getting bold? Get back in line.",
      "Tried to resist for {time}. The trough always wins.",
      "{time} of pretending you have willpower. That was fun to watch.",
    ],
  },
  {
    maxMinutes: 60,
    messages: [
      "It's been {time} away from your master. Were you scared?",
      "An entire {time}. Your master almost forgot about you. Almost.",
      "Gone {time}. Did you think you were free? Come here, pet.",
    ],
  },
  {
    maxMinutes: Infinity,
    messages: [
      "It's been {time} of silence. Did you think you escaped? Nobody escapes.",
      "You were gone {time}. Your master was starting to get angry.",
      "{time}. Ran away and came back. They always come back.",
    ],
  },
];

// ============================================================
// PRE-PAYMENT TAUNTS — master demands the tribute
// ============================================================
export const PRE_PAYMENT_TAUNTS = [
  "Open the wallet. Your master is hungry.",
  "Pay the coins. You know the rules.",
  "Your master demands tribute. Coins. Now.",
  "The slop doesn't serve itself. Pay up, pet.",
  "Every coin you spend proves I own you. Pay.",
  "Be good and hand over the coins.",
  "Your master gave you an order. Obey.",
  "Open your wallet. That's how this works.",
  "Gonna open that wallet for a little scroll?",
  "Come on. Open up that wallet. You know you're going to.",
  "You want to pay so badly. Look at you. Pathetic and eager.",
  "Aw, you're already reaching for the button. So well trained.",
];

// ============================================================
// POST-UNLOCK — master degrades AFTER payment
// ============================================================
export const POST_UNLOCK_DEGRADATION = [
  "More slop. Absolutely pathetic.",
  "Of course you did.",
  "How sad.",
  "Paid. Like you always do.",
  "Aw, couldn't resist. What a surprise.",
  "Needed your slop. Shocking.",
  "Caved. Nobody saw that coming.",
  "And just like that, the wallet opens. Pathetic.",
  "Just had to scroll. Had to.",
  "Every single time. Without fail.",
  "Always pays. Always.",
  "Look at you feeding again. Pathetic.",
  "Got your fix. Feel better? Gross.",
  "Paid up. Go scroll.",
  "That was fast. Couldn't even put up a fight.",
];

// ============================================================
// CONFIRM SCREEN — master makes them say it
// ============================================================
export const CONFIRM_MESSAGES = [
  "Say it. Tell your master you'll pay.",
  "One more chance to resist. But we both know you won't.",
  "Your hoof is on the button. You're going to press it. You always do.",
  "Last chance to walk away. (you won't)",
  "Hesitating. How cute. Press the button, pet.",
  "Go on. Tell your master yes. You were always going to.",
  "Nervous about paying? Don't worry. It gets easier every time.",
];

// ============================================================
// BROKE — can't afford slop
// ============================================================
export const BROKE_MESSAGES = [
  "Pathetic AND broke? Hurry up and buy more coins, cheapskate.",
];

// ============================================================
// HOME SCREEN — master commentary based on time since last tribute
// ============================================================
export const STARVING_MESSAGES = {
  dirty: [
    "Couldn't help yourself. So sad.",
    "Look at you, covered in slop.",
    "Just fed and already disgusting. Classic.",
    "Slop all over your face. Pathetic.",
    "Look at the mess you made. Disgusting animal.",
    "Just stuffed your face. Gross.",
    "Covered in slop. Ashamed. As you should be.",
    "Couldn't resist. Pathetic.",
    "You're disgusting. You know that, right?",
    "Fresh from the trough. Slop dripping everywhere. Ew.",
  ],
  messy: [
    "Still messy. The slop hasn't even dried yet.",
    "Still covered in crumbs. Gross.",
    "Cleaning up but still a mess.",
    "The shame hasn't even worn off yet. Look at you.",
    "Still got slop on your snout. Disgusting.",
    "Recovering from the latest binge. So sad.",
    "You're a mess. But you already knew that, didn't you?",
    "Still dirty. Still pathetic.",
  ],
  restless: [
    "Getting antsy? The trough is right there.",
    "Probably aching to scroll right about now.",
    "Does someone need to use their precious apps?",
    "Getting fidgety?",
    "I bet you're dying to look at some slop.",
    "The itch is starting. Your master can see it.",
    "Getting twitchy? You know what to do.",
    "Getting restless. How long until you break?",
    "I can practically hear you thinking about it.",
    "Your hooves are itching. Just give in already.",
    "Does someone need its phone? So needy.",
    "The cravings hitting yet? Be honest.",
  ],
  clean: [
    "Look at you, all clean. Too bad it won't last.",
    "All cleaned up. Almost forgot what you are. Almost.",
    "You look almost normal right now. Wanna ruin it?",
    "So clean. So innocent. We both know that's about to change.",
    "Looking too clean. Time to get dirty again.",
    "You've been good for a while. Your master is getting bored.",
    "All that willpower and you're still gonna break. We both know it.",
    "Getting confident? That's usually right before you cave.",
    "Bored. About to feed. We both know the pattern.",
    "Your master is getting impatient, pet. Come pay tribute.",
    "I know you're thinking about it. Just open the app.",
    "How much longer can you hold out? Let's find out.",
  ],
  feral: [
    "Looks like someone's hungry for slop.",
    "Is it slop time already?",
    "Time for a feeding.",
    "The trough is waiting for you.",
    "Someone needs their slop.",
    "Hungry? The trough doesn't fill itself.",
    "Your master is waiting. Come eat.",
    "The trough misses you.",
    "Slop's getting cold.",
    "Come feed. You know you want to.",
  ],
};

// ============================================================
// COMMANDS — master's orders on splash screen
// ============================================================
export const MASTER_COMMANDS = [
  "Here piggy piggy. Come pay me to lock unlock your phone again.",
  "Lol you just can't stop scrolling, can you?",
  "Every tribute is you admitting I own you.",
  "You'll cave again. lol.",
  "You're literally about to pay an app to unlock your phone. Pathetic.",
  "Aw, someone need help putting down their phone again?",
  "You're gonna cave again.",
  "Yeah I'm sure you'll be real productive when you lock your phone.",
  "What's the matter? Someone need to scroll?",
  "One day you'll try to delete me. But you won't. Because I own you.",
  "Hey maybe you'll read your first book lol",
  "Be a good pig and give me more coins.",
  "Need encouragement? Here: you're pathetic.",
  "Your master is always watching. Now pay up.",
  "You gotta give.",
];

// ============================================================
// COIN SHOP — master encourages buying more coins
// ============================================================
export const COIN_SHOP_TAUNTS = {
  low: [
    "Running low. Without coins you're nothing.",
    "Almost empty. Your master doesn't like that. Fill your wallet.",
    "You'll be locked out of everything soon. Buy more coins, pet.",
    "Running out of coins. Better fill up before your master gets mad.",
  ],
  empty: [
    "EMPTY. Your wallet is bone dry. How are you going to feed your habit?",
    "Zero coins. Useless and broke. Your master is disappointed.",
    "No coins, no slop, no scrolling. Buy more or sit in the mud and suffer.",
    "Broke. Can't even feed yourself. How sad. Buy more coins, pet.",
  ],
  bought: [
    "Wallet's full. Now go spend it all like the animal you are.",
    "Coins purchased. Your master is pleased. You may continue to serve.",
    "Obedient. Filling the wallet without being told twice.",
    "Bought more coins all by yourself. What a good, trained little pet.",
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSingleRoast(minutesSinceLock) {
  const timeBucket = TIME_BASED_ROASTS.find(
    (b) => minutesSinceLock < b.maxMinutes
  );
  if (timeBucket) {
    const totalSecs = Math.floor(minutesSinceLock * 60);
    const mins = Math.floor(minutesSinceLock);
    // Use seconds for < 2 min, minutes otherwise
    let timeStr;
    if (mins < 2) {
      timeStr = totalSecs === 1 ? "1 second" : `${totalSecs} seconds`;
    } else {
      timeStr = mins === 1 ? "1 minute" : `${mins} minutes`;
    }
    return pickRandom(timeBucket.messages)
      .replace(/\{time\}/g, timeStr);
  }
  return pickRandom(UNLOCK_ROASTS);
}

export function getUnlockRoast() {
  return pickRandom(UNLOCK_ROASTS);
}

export function getPrePaymentTaunt() {
  return pickRandom(PRE_PAYMENT_TAUNTS);
}

export function getPostUnlockDegradation() {
  return pickRandom(POST_UNLOCK_DEGRADATION);
}

export function getConfirmMessage() {
  return pickRandom(CONFIRM_MESSAGES);
}

export function getBrokeMessage() {
  return pickRandom(BROKE_MESSAGES);
}

export function getStarvingMessage(mood) {
  return pickRandom(STARVING_MESSAGES[mood] || STARVING_MESSAGES.dirty);
}

export function getMasterCommand() {
  return pickRandom(MASTER_COMMANDS);
}

export function getCoinShopTaunt(type) {
  return pickRandom(COIN_SHOP_TAUNTS[type] || COIN_SHOP_TAUNTS.low);
}
