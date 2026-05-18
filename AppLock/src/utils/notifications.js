// Safe import — native module not available until next EAS build
let Notifications = null;
try {
  Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log("[notifications] Native module not available — notifications disabled until next build");
}

// Messages get more aggressive the longer since last feed
const NOTIFICATION_MESSAGES = {
  // 30min-2hr: gentle teasing
  restless: [
    { title: "Your master is watching.", body: "Piggy's probably aching to scroll right about now." },
    { title: "Missing your slop?", body: "Does someone need to use their precious apps?" },
    { title: "Tick tock, piggy.", body: "I bet you're dying to look at some slop." },
    { title: "Getting twitchy?", body: "Your hooves are itching. Just give in already." },
    { title: "Aw, poor piggy.", body: "Does my little pig need its phone? So needy." },
    { title: "The itch is real.", body: "Your master can see you thinking about it." },
  ],
  // 2hr-6hr: aggressive prodding
  clean: [
    { title: "Your master is bored.", body: "My piggy's been too clean for too long. Time to get dirty." },
    { title: "Still resisting?", body: "All that willpower and you're still gonna break. We both know it." },
    { title: "Getting confident?", body: "That's usually right before you cave, piggy." },
    { title: "Come feed, pig.", body: "Your master is getting impatient. Come pay tribute." },
    { title: "The trough misses you.", body: "How much longer can the little piggy hold out?" },
    { title: "Remember your place.", body: "Clean pig is a bored pig. Bored pig is about to feed." },
  ],
  // 6hr+: furious demands
  feral: [
    { title: "WHERE HAVE YOU BEEN?", body: "Your master is ANGRY. Get back here and pay your tribute." },
    { title: "FERAL PIG.", body: "Get back to the trough. NOW." },
    { title: "Don't ignore your master.", body: "Nobody escapes the trough, piggy. Nobody." },
    { title: "Last warning, pig.", body: "Your master is losing patience. Feed yourself or else." },
    { title: "The pig always returns.", body: "Stop pretending you can resist. Open the app." },
  ],
};

// Lock expiry notification messages
const LOCK_EXPIRED_MESSAGES = [
  { title: "Timer's up, piggy.", body: "Your app is unlocked. Try not to be a pig about it." },
  { title: "Lock expired.", body: "You survived. For now. Your app is free." },
  { title: "Freedom. (For now.)", body: "Your lock timer ran out. Iron Snout streak continues." },
  { title: "You made it, pig.", body: "Timer's done. You actually held out. Impressive." },
  { title: "Unlocked.", body: "Your app is available again. Don't make your master regret it." },
  { title: "Time served.", body: "Lock expired. Go use your app. We both know you will." },
  { title: "IRON SNOUT.", body: "You held the line. Your app is unlocked. Respect." },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function requestPermissions() {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (e) {
    return false;
  }
}

// Schedule a notification for when a lock timer expires
export async function scheduleLockExpiryNotification(appName, expiresAt) {
  if (!Notifications) return;
  const delay = Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
  const msg = pickRandom(LOCK_EXPIRED_MESSAGES);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: appName ? `${appName}: ${msg.body}` : msg.body,
        sound: true,
      },
      trigger: { type: "timeInterval", seconds: delay, repeats: false },
    });
  } catch (e) {
    // skip
  }
}

// Immediate notification when lock expires (called from context)
export async function scheduleLockExpiry(appId) {
  if (!Notifications) return;
  const msg = pickRandom(LOCK_EXPIRED_MESSAGES);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (e) {
    // skip
  }
}

// Notification when peek window closes and apps re-lock
export async function notifyPeekExpired() {
  if (!Notifications) return;
  const messages = [
    { title: "Time's up, piggy.", body: "Your peek window is closed. Apps are locked again." },
    { title: "Back in the pen.", body: "2 minutes flew by, huh? Locked again." },
    { title: "Peek over.", body: "Hope you enjoyed those 2 minutes. Back to the slop lock." },
  ];
  const msg = pickRandom(messages);
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: msg.body, sound: true },
      trigger: null,
    });
  } catch (e) {}
}

// Schedule a notification for when peek window will close
export async function schedulePeekExpiryNotification(peekExpiresAt) {
  if (!Notifications) return;
  const delay = Math.max(1, Math.floor((peekExpiresAt - Date.now()) / 1000));
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "10 seconds left, pig.",
        body: "Your peek window is about to close. Say goodbye.",
        sound: true,
      },
      trigger: { type: "timeInterval", seconds: Math.max(1, delay - 10), repeats: false },
    });
  } catch (e) {}
}

// Notification when user surrenders
export async function notifySurrender() {
  if (!Notifications) return;
  const messages = [
    { title: "Full surrender.", body: "Apps unlocked. Your master is disappointed." },
    { title: "Weak.", body: "Couldn't hold out. Apps are free. For now." },
    { title: "Pathetic.", body: "You caved. Apps unlocked. Iron Snout broken." },
  ];
  const msg = pickRandom(messages);
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: msg.title, body: msg.body, sound: true },
      trigger: null,
    });
  } catch (e) {}
}

// Schedule escalating notifications based on minutes since last feed
export async function scheduleEggingNotifications(minutesSinceLastFeed) {
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    return;
  }

  const schedules = [];

  if (minutesSinceLastFeed < 30) {
    schedules.push({ delay: (30 - minutesSinceLastFeed) * 60, mood: "restless" });
    schedules.push({ delay: (60 - minutesSinceLastFeed) * 60, mood: "restless" });
    schedules.push({ delay: (120 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (240 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
    schedules.push({ delay: (720 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else if (minutesSinceLastFeed < 120) {
    schedules.push({ delay: (120 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (240 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else if (minutesSinceLastFeed < 360) {
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
    schedules.push({ delay: (720 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else {
    schedules.push({ delay: 60 * 60, mood: "feral" });
    schedules.push({ delay: 4 * 60 * 60, mood: "feral" });
  }

  for (const { delay, mood } of schedules) {
    if (delay <= 0) continue;
    const msg = pickRandom(NOTIFICATION_MESSAGES[mood] || NOTIFICATION_MESSAGES.restless);
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: msg.title, body: msg.body, sound: true },
        trigger: { type: "timeInterval", seconds: delay, repeats: false },
      });
    } catch (e) {
      // skip
    }
  }
}

export async function onTributePaid() {
  await scheduleEggingNotifications(0);
}

export async function refreshNotifications(lastTributeTime) {
  if (!lastTributeTime) return;
  const mins = Math.floor((Date.now() - lastTributeTime) / 60000);
  await scheduleEggingNotifications(mins);
}
