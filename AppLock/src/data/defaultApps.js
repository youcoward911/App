// App catalog with brand colors for icon rendering
// Icons are rendered as colored rounded squares with the first letter
// Once FamilyControls entitlement is approved, this will be replaced
// with Apple's native FamilyActivityPicker showing all installed apps

export const POPULAR_APPS = [
  // ── Social ──
  { id: "instagram", name: "Instagram", letter: "I", colors: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"], category: "Social" },
  { id: "tiktok", name: "TikTok", letter: "T", colors: ["#010101", "#010101"], category: "Social" },
  { id: "twitter", name: "X", letter: "X", colors: ["#000000", "#000000"], category: "Social" },
  { id: "facebook", name: "Facebook", letter: "f", colors: ["#1877F2", "#1877F2"], category: "Social" },
  { id: "snapchat", name: "Snapchat", letter: "S", colors: ["#FFFC00", "#FFFC00"], category: "Social" },
  { id: "reddit", name: "Reddit", letter: "R", colors: ["#FF4500", "#FF4500"], category: "Social" },
  { id: "discord", name: "Discord", letter: "D", colors: ["#5865F2", "#4752C4"], category: "Social" },
  { id: "pinterest", name: "Pinterest", letter: "P", colors: ["#E60023", "#C8102E"], category: "Social" },
  { id: "threads", name: "Threads", letter: "T", colors: ["#000000", "#333333"], category: "Social" },
  { id: "bluesky", name: "Bluesky", letter: "B", colors: ["#0085FF", "#0066CC"], category: "Social" },
  { id: "linkedin", name: "LinkedIn", letter: "L", colors: ["#0A66C2", "#004182"], category: "Social" },
  { id: "tumblr", name: "Tumblr", letter: "T", colors: ["#35465C", "#001935"], category: "Social" },
  { id: "bereal", name: "BeReal", letter: "B", colors: ["#000000", "#1A1A1A"], category: "Social" },
  { id: "lemon8", name: "Lemon8", letter: "L", colors: ["#FFE135", "#F5C800"], category: "Social" },

  // ── Messaging ──
  { id: "whatsapp", name: "WhatsApp", letter: "W", colors: ["#25D366", "#128C7E"], category: "Messaging" },
  { id: "telegram", name: "Telegram", letter: "T", colors: ["#0088CC", "#0077B5"], category: "Messaging" },
  { id: "imessage", name: "Messages", letter: "M", colors: ["#34C759", "#30B650"], category: "Messaging" },
  { id: "messenger", name: "Messenger", letter: "M", colors: ["#0084FF", "#A033FF"], category: "Messaging" },
  { id: "signal", name: "Signal", letter: "S", colors: ["#3A76F0", "#2C6DD8"], category: "Messaging" },
  { id: "slack", name: "Slack", letter: "S", colors: ["#4A154B", "#611F69"], category: "Messaging" },
  { id: "wechat", name: "WeChat", letter: "W", colors: ["#7BB32E", "#5EA01B"], category: "Messaging" },
  { id: "groupme", name: "GroupMe", letter: "G", colors: ["#00AFF0", "#0090D0"], category: "Messaging" },

  // ── Entertainment ──
  { id: "youtube", name: "YouTube", letter: "Y", colors: ["#FF0000", "#CC0000"], category: "Entertainment" },
  { id: "netflix", name: "Netflix", letter: "N", colors: ["#E50914", "#B20710"], category: "Entertainment" },
  { id: "twitch", name: "Twitch", letter: "T", colors: ["#9146FF", "#772CE8"], category: "Entertainment" },
  { id: "spotify", name: "Spotify", letter: "S", colors: ["#1DB954", "#1AA34A"], category: "Entertainment" },
  { id: "hulu", name: "Hulu", letter: "H", colors: ["#1CE783", "#15B76B"], category: "Entertainment" },
  { id: "disneyplus", name: "Disney+", letter: "D", colors: ["#113CCF", "#0D2D9E"], category: "Entertainment" },
  { id: "hbomax", name: "Max", letter: "M", colors: ["#002BE7", "#001AAA"], category: "Entertainment" },
  { id: "primevideo", name: "Prime Video", letter: "P", colors: ["#00A8E1", "#1A98C7"], category: "Entertainment" },
  { id: "appletv", name: "Apple TV+", letter: "A", colors: ["#333333", "#000000"], category: "Entertainment" },
  { id: "peacock", name: "Peacock", letter: "P", colors: ["#000000", "#1A1A1A"], category: "Entertainment" },
  { id: "paramount", name: "Paramount+", letter: "P", colors: ["#0064FF", "#004DCC"], category: "Entertainment" },
  { id: "crunchyroll", name: "Crunchyroll", letter: "C", colors: ["#F47521", "#E56517"], category: "Entertainment" },
  { id: "soundcloud", name: "SoundCloud", letter: "S", colors: ["#FF5500", "#E64D00"], category: "Entertainment" },
  { id: "applemusic", name: "Apple Music", letter: "A", colors: ["#FA233B", "#D91E34"], category: "Entertainment" },
  { id: "pandora", name: "Pandora", letter: "P", colors: ["#3668FF", "#224DCC"], category: "Entertainment" },

  // ── Gaming ──
  { id: "roblox", name: "Roblox", letter: "R", colors: ["#E2231A", "#C01D16"], category: "Gaming" },
  { id: "minecraft", name: "Minecraft", letter: "M", colors: ["#62B47A", "#4E9062"], category: "Gaming" },
  { id: "fortnite", name: "Fortnite", letter: "F", colors: ["#2E477A", "#1A2E55"], category: "Gaming" },
  { id: "candycrush", name: "Candy Crush", letter: "C", colors: ["#F7941D", "#E67E10"], category: "Gaming" },
  { id: "clashofclans", name: "Clash of Clans", letter: "C", colors: ["#4CAF50", "#388E3C"], category: "Gaming" },
  { id: "callofdutym", name: "Call of Duty", letter: "C", colors: ["#333333", "#1A1A1A"], category: "Gaming" },
  { id: "pokemongo", name: "Pokemon GO", letter: "P", colors: ["#F7D02C", "#E6BF1A"], category: "Gaming" },
  { id: "genshin", name: "Genshin Impact", letter: "G", colors: ["#4F7CAC", "#3A6090"], category: "Gaming" },
  { id: "steam", name: "Steam", letter: "S", colors: ["#1B2838", "#0E1621"], category: "Gaming" },
  { id: "appstore_games", name: "App Store Games", letter: "G", colors: ["#5856D6", "#AF52DE"], category: "Gaming" },

  // ── Shopping ──
  { id: "amazon", name: "Amazon", letter: "A", colors: ["#FF9900", "#E68A00"], category: "Shopping" },
  { id: "ebay", name: "eBay", letter: "e", colors: ["#E53238", "#C42A2F"], category: "Shopping" },
  { id: "shein", name: "Shein", letter: "S", colors: ["#000000", "#1A1A1A"], category: "Shopping" },
  { id: "temu", name: "Temu", letter: "T", colors: ["#F26522", "#D45518"], category: "Shopping" },
  { id: "walmart", name: "Walmart", letter: "W", colors: ["#0071CE", "#005AA0"], category: "Shopping" },
  { id: "target", name: "Target", letter: "T", colors: ["#CC0000", "#AA0000"], category: "Shopping" },
  { id: "etsy", name: "Etsy", letter: "E", colors: ["#F56400", "#D65800"], category: "Shopping" },
  { id: "nike", name: "Nike", letter: "N", colors: ["#111111", "#000000"], category: "Shopping" },
  { id: "doordash", name: "DoorDash", letter: "D", colors: ["#FF3008", "#E02B07"], category: "Shopping" },
  { id: "ubereats", name: "Uber Eats", letter: "U", colors: ["#06C167", "#05A858"], category: "Shopping" },
  { id: "grubhub", name: "Grubhub", letter: "G", colors: ["#F63440", "#D92D37"], category: "Shopping" },
  { id: "instacart", name: "Instacart", letter: "I", colors: ["#43B02A", "#379023"], category: "Shopping" },

  // ── Dating ──
  { id: "tinder", name: "Tinder", letter: "T", colors: ["#FE3C72", "#FF655B"], category: "Dating" },
  { id: "bumble", name: "Bumble", letter: "B", colors: ["#FFC629", "#E6B024"], category: "Dating" },
  { id: "hinge", name: "Hinge", letter: "H", colors: ["#000000", "#1A1A1A"], category: "Dating" },
  { id: "grindr", name: "Grindr", letter: "G", colors: ["#F8C73E", "#E6B635"], category: "Dating" },

  // ── Browsers ──
  { id: "safari", name: "Safari", letter: "S", colors: ["#006CFF", "#0050D0"], category: "Browser" },
  { id: "chrome", name: "Chrome", letter: "C", colors: ["#4285F4", "#34A853"], category: "Browser" },
  { id: "firefox", name: "Firefox", letter: "F", colors: ["#FF7139", "#E65C2E"], category: "Browser" },
  { id: "brave", name: "Brave", letter: "B", colors: ["#FB542B", "#E04422"], category: "Browser" },
  { id: "opera", name: "Opera", letter: "O", colors: ["#FF1B2D", "#D91626"], category: "Browser" },
  { id: "edge", name: "Edge", letter: "E", colors: ["#0078D7", "#005FAA"], category: "Browser" },

  // ── News / Reading ──
  { id: "applenews", name: "Apple News", letter: "N", colors: ["#FA2D48", "#D9263E"], category: "News" },
  { id: "flipboard", name: "Flipboard", letter: "F", colors: ["#E12828", "#C42222"], category: "News" },
  { id: "medium", name: "Medium", letter: "M", colors: ["#000000", "#1A1A1A"], category: "News" },
  { id: "kindle", name: "Kindle", letter: "K", colors: ["#FF9900", "#E68A00"], category: "News" },
  { id: "substack", name: "Substack", letter: "S", colors: ["#FF6719", "#E65C16"], category: "News" },

  // ── Productivity ──
  { id: "mail", name: "Mail", letter: "M", colors: ["#007AFF", "#0060CC"], category: "Productivity" },
  { id: "gmail", name: "Gmail", letter: "G", colors: ["#EA4335", "#D93628"], category: "Productivity" },
  { id: "outlook", name: "Outlook", letter: "O", colors: ["#0078D4", "#005EA6"], category: "Productivity" },
  { id: "photos", name: "Photos", letter: "P", colors: ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5AC8FA", "#007AFF"], category: "Productivity" },
  { id: "tiktokshop", name: "TikTok Shop", letter: "T", colors: ["#000000", "#EE1D52"], category: "Shopping" },
];

export const CATEGORIES = [
  "All",
  "Social",
  "Messaging",
  "Entertainment",
  "Gaming",
  "Shopping",
  "Dating",
  "Browser",
  "News",
  "Productivity",
];
