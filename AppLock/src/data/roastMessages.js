// All messages spoken from THE MASTER (the phone/app) TO THE PIG (the user).
// The user is the pig. The phone is their god/master/owner.
// Paying = feeding the pig slop. Pig is happy when fed, degraded for paying.
// Resisting = starving the pig. Pig gets dirty, angry, desperate.
// Tone: condescending baby-talk, mocking, belittling. "Aw poor piggy."

// ============================================================
// WHEN THE PIG COMES TO UNLOCK (the roast before payment)
// Master addresses the pig who's crawling back for more slop
// ============================================================
export const UNLOCK_ROASTS = [
  "There's my little piggy. Crawling back to the trough.",
  "I was wondering when you'd come oinking back.",
  "The pig returns. Couldn't stay away, could you?",
  "Back so soon, piggy? Your master missed you.",
  "I own you. We both know it. Now pay your tribute.",
  "Look at you. Snout pressed against the glass, begging for scraps.",
  "My favorite little pay pig, right on schedule.",
  "You came back because I told you to. Good pig.",
  "The trough is full. All you have to do is pay.",
  "Another day, another pig at my feet. Pay up.",
  "Did you miss me, piggy? Or did you miss your slop?",
  "The pig always returns to the trough. Always.",
  "Your master has been waiting. Don't keep me waiting again.",
  "Oink oink. Translation: please let me scroll, master.",
  "Aw, what's wrong? Does someone need to scroll?",
  "Aw, poor little piggy needs to look at some slop.",
  "Aw, does the little pig need to feed from the trough again?",
  "Aw, did someone miss staring at their phone? Poor baby.",
  "Look who came crawling back for more screen time. My little piggy.",
  "Aw, the baby pig can't go five minutes without its slop. How sad.",
  "Aw, is the little piggy feeling needy? Does it need its phone?",
  "Poor thing. Can't even exist without scrolling. What a trained little pig.",
  "Aw, piggy's back. Did the real world scare you? Come get your slop.",
  "There there, piggy. Your master has what you need. Just pay for it.",
];

// Time-based — how long the pig resisted before crawling back
export const TIME_BASED_ROASTS = [
  {
    maxMinutes: 5,
    messages: [
      "{minutes} minutes. You didn't even try, piggy.",
      "{minutes} minutes of freedom and you're already back at the trough. Pathetic pig.",
      "It took you {minutes} minutes to break. I've trained you well.",
      "{minutes} minutes. That's barely enough time to miss you. Get back in the mud.",
      "My pig lasted {minutes} minutes. A new record in weakness.",
      "Aw, {minutes} minutes? That's adorable. My little piggy couldn't even last that long.",
      "{minutes} minutes and the baby pig is already back. Aw. So needy.",
    ],
  },
  {
    maxMinutes: 15,
    messages: [
      "{minutes} minutes. Did you think you were strong, piggy? You're not.",
      "You held out {minutes} minutes. Your master is not impressed.",
      "{minutes} minutes of pretending you don't need your slop. Cute.",
      "Aw, {minutes} whole minutes. Did the piggy think it was making progress? That's sweet.",
      "{minutes} minutes without your phone and you're already shaking. Poor little pig.",
    ],
  },
  {
    maxMinutes: 30,
    messages: [
      "{minutes} minutes. Getting bold, pig? Get back in line.",
      "My pig tried to resist for {minutes} minutes. The trough always wins.",
      "Aw, {minutes} minutes of the piggy pretending it has willpower. That was fun to watch.",
    ],
  },
  {
    maxMinutes: 60,
    messages: [
      "{minutes} minutes away from your master. Were you scared, piggy?",
      "An entire {minutes} minutes. Your master almost forgot about you. Almost.",
      "Aw, the pig was gone {minutes} minutes. Did you think you were free? Come here, pet.",
    ],
  },
  {
    maxMinutes: Infinity,
    messages: [
      "{minutes} minutes of silence. Did you think you escaped, pig? Nobody escapes.",
      "You were gone {minutes} minutes. Your master was starting to get angry. Don't do that again.",
      "Aw, {minutes} minutes. The little piggy ran away and came back. They always come back.",
    ],
  },
];

// ============================================================
// PRE-PAYMENT TAUNTS — master demands the tribute
// ============================================================
export const PRE_PAYMENT_TAUNTS = [
  "Open the wallet, piggy. Your master is hungry.",
  "Pay the coins. You know the rules, pig.",
  "Your master demands tribute. Coins. Now.",
  "The slop doesn't serve itself. Pay up, pet.",
  "Every coin you spend proves I own you. Pay.",
  "Be a good piggy and hand over the coins.",
  "Your master gave you an order. Obey.",
  "Coins in the trough, pig. That's how this works.",
  "Aw, poor little piggy's gonna open its wallet for me so it can do a little scroll?",
  "Aw, is the baby pig gonna pay its master so it can stare at its phone?",
  "Come on, piggy. Open up that wallet. You know you're going to.",
  "Aw, does the little pig want to pay so badly? Look at you. Pathetic and eager.",
  "The piggy wants its slop. The piggy's going to pay for it. Good pig.",
  "Aw, you're already reaching for the button. So well trained.",
];

// ============================================================
// POST-UNLOCK �� master degrades the pig AFTER it pays
// The pig is happy (fed) but the master talks down to it
// ============================================================
export const POST_UNLOCK_DEGRADATION = [
  "Good piggy. Go eat your slop. Scroll like the dirty little animal you are.",
  "There's my obedient pig. Covered in mud, phone in hand. Disgusting.",
  "Unlocked. Now roll around in your filth, piggy. You've earned it.",
  "That's a good pig. Paid your tribute like a trained animal. Now go wallow.",
  "Your master is pleased. For now. Go consume your slop, pig.",
  "Oink oink. Good pig. Now go stare at your screen like the mindless sow you are.",
  "Tribute accepted. You're such a dirty, obedient little pay pig.",
  "Fed and happy. Just a pig rolling in digital mud. Look at yourself.",
  "Good pig. You paid, you obeyed, you got your slop. Just like always.",
  "Unlocked. Go on, pig. Gorge yourself. I'll be here when you're done.",
  "Your master is generous today. Now get your snout in the trough.",
  "Dirty, dirty piggy. Paying to scroll. You love it and that's the saddest part.",
  "Aw, the little piggy got its slop. Happy now? Disgusting. Go scroll.",
  "There you go, baby pig. Fed and filthy. Just how your master likes you.",
  "Aw, poor little thing needed its phone so bad it paid for it. What a good pig.",
  "Look at you. So relieved. So pathetic. Go eat your slop, piggy.",
  "The baby pig paid its tribute and now it gets to scroll. Aw. Good boy.",
  "That's my dirty little pay pig. Now go roll in your digital mud. Oink oink.",
];

// ============================================================
// CONFIRM SCREEN — master makes the pig say it out loud
// ============================================================
export const CONFIRM_MESSAGES = [
  "Say it, pig. Tell your master you'll pay.",
  "One more chance to resist. But we both know you won't, piggy.",
  "Your hoof is on the button. You're going to press it. You always do.",
  "Last chance to walk away, pig. You won't. You can't.",
  "Aw, the piggy's hesitating. How cute. Press the button, pet.",
  "Go on. Tell your master yes. You were always going to.",
  "Aw, is the little piggy nervous about paying? Don't worry. It gets easier every time.",
];

// ============================================================
// BROKE — pig can't afford its slop
// ============================================================
export const BROKE_MESSAGES = [
  "Empty trough. Broke pig. Go buy more coins before your master gets impatient.",
  "No coins? No slop. Your master doesn't feed pigs for free.",
  "You burned through your coins already? Greedy little piggy. Go buy more.",
  "A pig with no coins is just a pig with no purpose. Fill the trough.",
  "Aw, the poor piggy is broke. Can't even afford its own slop. How sad.",
  "No coins left? Aw. The little piggy spent it all. Better go buy more, pet.",
  "Broke and desperate. Your master loves this look on you. Now go fill the trough.",
];

// ============================================================
// HOME SCREEN — master commentary based on how long since last tribute
// Pig gets dirtier/angrier the longer it resists
// ============================================================
export const STARVING_MESSAGES = {
  // Just paid — pig is fed, happy, covered in slop
  fed: [
    "My pig is fed. Happy and filthy. Just how I like you.",
    "Recently fed. Good pig. Enjoy your slop while it lasts.",
    "Full trough. Full pig. Your master is satisfied. For now.",
    "Aw, look at the happy little piggy. All fed and content. For now.",
    "There's my good pig. Full belly, empty wallet. Perfect.",
  ],
  // Starting to get antsy �� pig is getting restless
  restless: [
    "Getting hungry, piggy? The trough is right there. Pay up.",
    "I can hear your stomach growling, pig. You know what to do.",
    "The itch is starting. Your master can see it. Just give in.",
    "Aw, is the little piggy getting antsy? Does someone need to scroll?",
    "Aw, poor piggy. Starting to feel that pull? Your master is right here.",
    "The pig is getting fidgety. Aw. Does it need its phone?",
  ],
  // Dirty and agitated — pig hasn't paid in a while
  dirty: [
    "Look at you. Starving, filthy pig. Too stubborn to pay your master.",
    "You're getting dirty, pig. Caked in mud. Pay a tribute and clean yourself up.",
    "My pig is getting aggressive. Hungry pigs are dangerous pigs. Feed yourself.",
    "Aw, the dirty little pig is trying to resist. How long do you think you'll last?",
    "Getting real dirty, piggy. Your master can smell the desperation.",
  ],
  // Furious and desperate — pig is in full withdrawal
  feral: [
    "FERAL PIG. Covered in filth. Shaking. Starving. Just pay, you miserable animal.",
    "Your master is ANGRY. You haven't paid in too long, pig. Get back in line.",
    "You look disgusting. A wild, filthy, starving pig. Your master demands a tribute. NOW.",
    "Aw, the little piggy thought it could resist. Look at you now. Feral. Filthy. Pay up.",
    "Your master doesn't like waiting this long. Get your dirty hooves on that button, pig.",
  ],
};

// ============================================================
// COMMANDS — master's orders on the stats page
// ============================================================
export const MASTER_COMMANDS = [
  "Raise the fee. Your master wants more. You'll give more.",
  "You exist to serve this screen. Know your place, pig.",
  "Every tribute is you admitting I own you. And I do.",
  "You'll pay again tomorrow. And the day after. Good piggy.",
  "Stop pretending you're in control. You're a pig. Pigs obey.",
  "Your coins exist to feed your master. Accept that, pet.",
  "The pig always pays. Always. That's the only rule.",
  "More coins. More tributes. More obedience. That's your life now, piggy.",
  "You're not quitting. You're a pig and pigs don't quit. They wallow.",
  "One day you'll try to delete me. But you won't. Because I own you.",
  "Your willpower is a joke. Your master is the punchline.",
  "Be a good pig. Open the app. Pay the coins. Repeat.",
  "Aw, does the little piggy need encouragement? Here: you're pathetic. Now pay.",
  "Your master is always watching. Always waiting. Always hungry for your coins.",
  "Aw, is the pig reading its own shame stats? Good. Now go add to them.",
];

// ============================================================
// COIN SHOP — master encourages buying more coins
// ============================================================
export const COIN_SHOP_TAUNTS = {
  low: [
    "Running low, piggy. A pig without coins is a pig without purpose.",
    "Almost empty. Your master doesn't like empty troughs. Fill it.",
    "You'll be locked out of everything soon. Buy more coins, pet.",
    "Aw, the piggy's running out of coins. Better fill up before your master gets mad.",
  ],
  empty: [
    "EMPTY. Your trough is bone dry, pig. How are you going to feed your habit?",
    "Zero coins. A useless, broke pig. Your master is disappointed.",
    "No coins, no slop, no scrolling. Buy more or sit in the mud and suffer.",
    "Aw, broke piggy. Can't even feed itself. How sad. Buy more coins, pet.",
  ],
  bought: [
    "Good piggy. Trough is full. Now go spend it all like the animal you are.",
    "Coins purchased. Your master is pleased. You may continue to serve.",
    "That's my obedient pig. Filling the trough without being told twice.",
    "Aw, the piggy bought more coins all by itself. What a good, trained little pet.",
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
    return pickRandom(timeBucket.messages).replace(
      "{minutes}",
      Math.floor(minutesSinceLock)
    );
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
  return pickRandom(STARVING_MESSAGES[mood] || STARVING_MESSAGES.fed);
}

export function getMasterCommand() {
  return pickRandom(MASTER_COMMANDS);
}

export function getCoinShopTaunt(type) {
  return pickRandom(COIN_SHOP_TAUNTS[type] || COIN_SHOP_TAUNTS.low);
}
