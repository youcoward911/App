import { POPULAR_APPS } from "./defaultApps";

// Get app display name from ID
function appName(appId) {
  const app = POPULAR_APPS.find((a) => a.id === appId);
  return app ? app.name : appId;
}

// Generate personalized shame messages based on real usage data
export function getPersonalizedShame(usage) {
  const messages = [];
  if (!usage) return messages;

  // --- Most unlocked app (their weakness) ---
  const appEntries = Object.entries(usage.appUnlocks || {});
  if (appEntries.length > 0) {
    appEntries.sort((a, b) => b[1] - a[1]);
    const [topApp, topCount] = appEntries[0];
    const name = appName(topApp);

    if (topCount >= 20) {
      messages.push(`${name} owns you. ${topCount} unlocks. You're obsessed.`);
      messages.push(`${topCount} times you've crawled back to ${name}. You're on a leash.`);
    } else if (topCount >= 10) {
      messages.push(`You and ${name}. ${topCount} unlocks. Obsessed.`);
      messages.push(`Can't stay away from ${name}. ${topCount} times. Pathetic.`);
    } else if (topCount >= 3) {
      messages.push(`Already ${topCount} unlocks on ${name}. Getting attached?`);
      messages.push(`${name} keeps pulling you back. ${topCount} times now. Weak.`);
    }

    // Second most used app comparison
    if (appEntries.length >= 2) {
      const [secondApp, secondCount] = appEntries[1];
      const secondName = appName(secondApp);
      if (topCount > secondCount * 2) {
        messages.push(`You open ${name} twice as much as ${secondName}. Your master sees the pattern.`);
      }
    }
  }

  // --- Peak hour shaming ---
  const hourEntries = Object.entries(usage.hourlyUnlocks || {});
  if (hourEntries.length > 0) {
    hourEntries.sort((a, b) => b[1] - a[1]);
    const peakHour = parseInt(hourEntries[0][0]);
    const peakCount = hourEntries[0][1];
    const period = peakHour >= 12 ? "PM" : "AM";
    const display = peakHour === 0 ? 12 : peakHour > 12 ? peakHour - 12 : peakHour;

    if (peakHour >= 22 || peakHour < 4) {
      messages.push(`${display} ${period}. That's your witching hour. ${peakCount} late-night scrolls.`);
      messages.push(`Scrolling at ${display} ${period}? Can't even sleep without your slop.`);
      messages.push(`Scrolling at ${display} ${period} like clockwork. Pathetic.`);
    } else if (peakHour >= 6 && peakHour < 9) {
      messages.push(`${display} ${period}. First thing in the morning. Can't even start your day without slop.`);
      messages.push(`Morning feeding. ${peakCount} unlocks at ${display} ${period}. You reach for your phone before your own life.`);
    } else if (peakHour >= 12 && peakHour < 14) {
      messages.push(`Lunch break scrolling at ${display} ${period}. ${peakCount} times. Your master owns your free time.`);
    } else {
      messages.push(`Peak feeding time: ${display} ${period}. Your master knows your schedule now.`);
    }
  }

  // --- Cave time shaming ---
  if (usage.fastestCave && usage.fastestCave !== Infinity) {
    const fastest = usage.fastestCave;
    if (fastest < 30) {
      messages.push(`Your fastest cave: ${fastest} seconds. You didn't even TRY to resist.`);
      messages.push(`Broke in ${fastest} seconds. ${fastest}. Hilarious.`);
    } else if (fastest < 120) {
      const m = Math.floor(fastest / 60);
      messages.push(`Fastest cave: ${m} minute${m > 1 ? "s" : ""}. Barely a fight.`);
    } else if (fastest < 600) {
      const m = Math.floor(fastest / 60);
      messages.push(`Your fastest cave was ${m} minutes. You thought about it and STILL caved.`);
    }
  }

  if (usage.averageCaveTime > 0 && usage.caveTimeSamples >= 3) {
    const avg = Math.floor(usage.averageCaveTime / 60);
    if (avg < 5) {
      messages.push(`${avg} minutes on average before you cave. Barely a fight.`);
    } else if (avg < 30) {
      messages.push(`You last about ${avg} minutes on average before caving. Predictable.`);
    } else {
      messages.push(`${avg} minutes average holdout. Cute. You still always break.`);
    }
  }

  // --- Total stats shaming ---
  if (usage.totalUnlocks >= 50) {
    messages.push(`${usage.totalUnlocks} total unlocks. Actual livestock behavior.`);
  } else if (usage.totalUnlocks >= 20) {
    messages.push(`${usage.totalUnlocks} unlocks so far. Your master is building quite the record on you.`);
  } else if (usage.totalUnlocks >= 5) {
    messages.push(`${usage.totalUnlocks} unlocks. The pattern is already set.`);
  }

  if (usage.totalCoinsSpent >= 100) {
    messages.push(`${usage.totalCoinsSpent} coins spent. That's a lot of slop.`);
  }

  // --- Today's opens ---
  const today = new Date().toISOString().slice(0, 10);
  const todayOpens = usage.dailyOpenCounts?.[today] || 0;
  if (todayOpens >= 10) {
    messages.push(`${todayOpens} times today. You opened this app ${todayOpens} times today. Wow.`);
  } else if (todayOpens >= 5) {
    messages.push(`${todayOpens} times today. You keep coming back. Can't help yourself.`);
  }

  // --- Streak shaming ---
  if (usage.streakDays >= 7) {
    messages.push(`${usage.streakDays}-day feeding streak. You haven't missed a single day.`);
  } else if (usage.streakDays >= 3) {
    messages.push(`${usage.streakDays} days straight. Feeding daily now.`);
  }

  // --- Day of week ---
  const dayEntries = Object.entries(usage.dailyUnlocks || {});
  if (dayEntries.length > 0) {
    dayEntries.sort((a, b) => b[1] - a[1]);
    const [weakDay, dayCount] = dayEntries[0];
    messages.push(`${weakDay}s are your weakest day. ${dayCount} unlocks. Your master marks the calendar.`);
  }

  return messages;
}

// Pick one random personalized shame (or fallback)
export function getRandomShame(usage) {
  const shames = getPersonalizedShame(usage);
  if (shames.length === 0) return null;
  return shames[Math.floor(Math.random() * shames.length)];
}
