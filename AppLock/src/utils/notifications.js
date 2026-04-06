import * as Notifications from "expo-notifications";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Messages get more aggressive the longer since last feed
const NOTIFICATION_MESSAGES = {
  // 30min–2hr: gentle teasing
  restless: [
    { title: "Your master is watching.", body: "Piggy's probably aching to scroll right about now." },
    { title: "Missing your slop?", body: "Does someone need to use their precious apps?" },
    { title: "Tick tock, piggy.", body: "I bet you're dying to look at some slop." },
    { title: "Getting twitchy?", body: "Your hooves are itching. Just give in already." },
    { title: "Aw, poor piggy.", body: "Does my little pig need its phone? So needy." },
    { title: "The itch is real.", body: "Your master can see you thinking about it." },
  ],
  // 2hr–6hr: aggressive prodding
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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Schedule escalating notifications based on minutes since last feed
export async function scheduleEggingNotifications(minutesSinceLastFeed) {
  // Cancel any previously scheduled ones
  await Notifications.cancelAllScheduledNotificationsAsync();

  const schedules = [];

  // If pig just fed (< 30min), schedule future notifications
  if (minutesSinceLastFeed < 30) {
    // At ~30 min: restless nudge
    schedules.push({ delay: (30 - minutesSinceLastFeed) * 60, mood: "restless" });
    // At ~1hr: another restless
    schedules.push({ delay: (60 - minutesSinceLastFeed) * 60, mood: "restless" });
    // At ~2hr: clean
    schedules.push({ delay: (120 - minutesSinceLastFeed) * 60, mood: "clean" });
    // At ~4hr: clean aggressive
    schedules.push({ delay: (240 - minutesSinceLastFeed) * 60, mood: "clean" });
    // At ~6hr: feral
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
    // At ~12hr: feral
    schedules.push({ delay: (720 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else if (minutesSinceLastFeed < 120) {
    // Restless phase: schedule clean + feral
    schedules.push({ delay: (120 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (240 - minutesSinceLastFeed) * 60, mood: "clean" });
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else if (minutesSinceLastFeed < 360) {
    // Clean phase: schedule feral
    schedules.push({ delay: (360 - minutesSinceLastFeed) * 60, mood: "feral" });
    schedules.push({ delay: (720 - minutesSinceLastFeed) * 60, mood: "feral" });
  } else {
    // Already feral: send one soon, another later
    schedules.push({ delay: 60 * 60, mood: "feral" }); // 1hr
    schedules.push({ delay: 4 * 60 * 60, mood: "feral" }); // 4hr
  }

  for (const { delay, mood } of schedules) {
    if (delay <= 0) continue;
    const msg = pickRandom(NOTIFICATION_MESSAGES[mood] || NOTIFICATION_MESSAGES.restless);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: {
        type: "timeInterval",
        seconds: delay,
        repeats: false,
      },
    });
  }
}

// Call after every unlock/tribute to reschedule from 0
export async function onTributePaid() {
  await scheduleEggingNotifications(0);
}

// Call on app open to reschedule based on current gap
export async function refreshNotifications(lastTributeTime) {
  if (!lastTributeTime) return;
  const mins = Math.floor((Date.now() - lastTributeTime) / 60000);
  await scheduleEggingNotifications(mins);
}
