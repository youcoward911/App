// Default list of popular apps users might want to lock
// On a real device, this would be populated from the device's installed apps

export const POPULAR_APPS = [
  { id: "instagram", name: "Instagram", icon: "📸", category: "Social" },
  { id: "tiktok", name: "TikTok", icon: "🎵", category: "Social" },
  { id: "twitter", name: "X (Twitter)", icon: "🐦", category: "Social" },
  { id: "facebook", name: "Facebook", icon: "👤", category: "Social" },
  { id: "snapchat", name: "Snapchat", icon: "👻", category: "Social" },
  { id: "reddit", name: "Reddit", icon: "🤖", category: "Social" },
  { id: "youtube", name: "YouTube", icon: "▶️", category: "Entertainment" },
  { id: "netflix", name: "Netflix", icon: "🎬", category: "Entertainment" },
  { id: "twitch", name: "Twitch", icon: "🎮", category: "Entertainment" },
  { id: "discord", name: "Discord", icon: "💬", category: "Social" },
  { id: "pinterest", name: "Pinterest", icon: "📌", category: "Social" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", category: "Messaging" },
  { id: "telegram", name: "Telegram", icon: "✈️", category: "Messaging" },
  { id: "safari", name: "Safari", icon: "🧭", category: "Browser" },
  { id: "chrome", name: "Chrome", icon: "🌐", category: "Browser" },
  { id: "games", name: "Games", icon: "🕹️", category: "Entertainment" },
];

export const CATEGORIES = [
  "All",
  "Social",
  "Entertainment",
  "Messaging",
  "Browser",
];
