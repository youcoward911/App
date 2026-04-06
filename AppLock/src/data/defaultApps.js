// App catalog with brand colors for fallback icon rendering
// Real icons are fetched from Apple's iTunes API at runtime

export const POPULAR_APPS = [
  // ── Social ──
  { id: "instagram", name: "Instagram", letter: "I", colors: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"], category: "Social", bundleId: "com.burbn.instagram" },
  { id: "tiktok", name: "TikTok", letter: "T", colors: ["#010101", "#010101"], category: "Social", bundleId: "com.zhiliaoapp.musically" },
  { id: "twitter", name: "X", letter: "X", colors: ["#000000", "#000000"], category: "Social", bundleId: "com.atebits.Tweetie2" },
  { id: "facebook", name: "Facebook", letter: "f", colors: ["#1877F2", "#1877F2"], category: "Social", bundleId: "com.facebook.Facebook" },
  { id: "snapchat", name: "Snapchat", letter: "S", colors: ["#FFFC00", "#FFFC00"], category: "Social", bundleId: "com.toyopagroup.picaboo" },
  { id: "reddit", name: "Reddit", letter: "R", colors: ["#FF4500", "#FF4500"], category: "Social", bundleId: "com.reddit.Reddit" },
  { id: "discord", name: "Discord", letter: "D", colors: ["#5865F2", "#4752C4"], category: "Social", bundleId: "com.hammerandchisel.discord" },
  { id: "pinterest", name: "Pinterest", letter: "P", colors: ["#E60023", "#C8102E"], category: "Social", bundleId: "pinterest" },
  { id: "threads", name: "Threads", letter: "T", colors: ["#000000", "#333333"], category: "Social", bundleId: "com.burbn.barcelona" },
  { id: "bluesky", name: "Bluesky", letter: "B", colors: ["#0085FF", "#0066CC"], category: "Social", bundleId: "xyz.blueskyweb.app" },
  { id: "linkedin", name: "LinkedIn", letter: "L", colors: ["#0A66C2", "#004182"], category: "Social", bundleId: "com.linkedin.LinkedIn" },
  { id: "tumblr", name: "Tumblr", letter: "T", colors: ["#35465C", "#001935"], category: "Social", bundleId: "com.tumblr.tumblr" },
  { id: "bereal", name: "BeReal", letter: "B", colors: ["#000000", "#1A1A1A"], category: "Social", bundleId: "AlexisBarreyworthy.BeReal" },
  { id: "lemon8", name: "Lemon8", letter: "L", colors: ["#FFE135", "#F5C800"], category: "Social", bundleId: "com.bd.nproject" },

  // ── Messaging ──
  { id: "whatsapp", name: "WhatsApp", letter: "W", colors: ["#25D366", "#128C7E"], category: "Messaging", bundleId: "net.whatsapp.WhatsApp" },
  { id: "telegram", name: "Telegram", letter: "T", colors: ["#0088CC", "#0077B5"], category: "Messaging", bundleId: "ph.telegra.Telegraph" },
  { id: "imessage", name: "Messages", letter: "M", colors: ["#34C759", "#30B650"], category: "Messaging", bundleId: "com.apple.MobileSMS" },
  { id: "messenger", name: "Messenger", letter: "M", colors: ["#0084FF", "#A033FF"], category: "Messaging", bundleId: "com.facebook.Messenger" },
  { id: "signal", name: "Signal", letter: "S", colors: ["#3A76F0", "#2C6DD8"], category: "Messaging", bundleId: "org.whispersystems.signal" },
  { id: "slack", name: "Slack", letter: "S", colors: ["#4A154B", "#611F69"], category: "Messaging", bundleId: "com.tinyspeck.chatlyio" },
  { id: "wechat", name: "WeChat", letter: "W", colors: ["#7BB32E", "#5EA01B"], category: "Messaging", bundleId: "com.tencent.xin" },
  { id: "groupme", name: "GroupMe", letter: "G", colors: ["#00AFF0", "#0090D0"], category: "Messaging", bundleId: "com.groupme.iphone-app" },

  // ── Entertainment ──
  { id: "youtube", name: "YouTube", letter: "Y", colors: ["#FF0000", "#CC0000"], category: "Entertainment", bundleId: "com.google.ios.youtube" },
  { id: "netflix", name: "Netflix", letter: "N", colors: ["#E50914", "#B20710"], category: "Entertainment", bundleId: "com.netflix.Netflix" },
  { id: "twitch", name: "Twitch", letter: "T", colors: ["#9146FF", "#772CE8"], category: "Entertainment", bundleId: "tv.twitch" },
  { id: "spotify", name: "Spotify", letter: "S", colors: ["#1DB954", "#1AA34A"], category: "Entertainment", bundleId: "com.spotify.client" },
  { id: "hulu", name: "Hulu", letter: "H", colors: ["#1CE783", "#15B76B"], category: "Entertainment", bundleId: "com.hulu.plus" },
  { id: "disneyplus", name: "Disney+", letter: "D", colors: ["#113CCF", "#0D2D9E"], category: "Entertainment", bundleId: "com.disney.disneyplus" },
  { id: "hbomax", name: "Max", letter: "M", colors: ["#002BE7", "#001AAA"], category: "Entertainment", bundleId: "com.wbd.stream" },
  { id: "primevideo", name: "Prime Video", letter: "P", colors: ["#00A8E1", "#1A98C7"], category: "Entertainment", bundleId: "com.amazon.aiv.AIVApp" },
  { id: "appletv", name: "Apple TV+", letter: "A", colors: ["#333333", "#000000"], category: "Entertainment", bundleId: "com.apple.tv" },
  { id: "peacock", name: "Peacock", letter: "P", colors: ["#000000", "#1A1A1A"], category: "Entertainment", bundleId: "com.peacocktv.peacockandroid" },
  { id: "paramount", name: "Paramount+", letter: "P", colors: ["#0064FF", "#004DCC"], category: "Entertainment", bundleId: "com.cbs.app" },
  { id: "crunchyroll", name: "Crunchyroll", letter: "C", colors: ["#F47521", "#E56517"], category: "Entertainment", bundleId: "com.crunchyroll.iphone" },
  { id: "soundcloud", name: "SoundCloud", letter: "S", colors: ["#FF5500", "#E64D00"], category: "Entertainment", bundleId: "com.soundcloud.TouchApp" },
  { id: "applemusic", name: "Apple Music", letter: "A", colors: ["#FA233B", "#D91E34"], category: "Entertainment", bundleId: "com.apple.Music" },
  { id: "pandora", name: "Pandora", letter: "P", colors: ["#3668FF", "#224DCC"], category: "Entertainment", bundleId: "com.pandora" },

  // ── Gaming ──
  { id: "roblox", name: "Roblox", letter: "R", colors: ["#E2231A", "#C01D16"], category: "Gaming", bundleId: "com.roblox.robloxmobile" },
  { id: "minecraft", name: "Minecraft", letter: "M", colors: ["#62B47A", "#4E9062"], category: "Gaming", bundleId: "com.mojang.minecraftpe" },
  { id: "fortnite", name: "Fortnite", letter: "F", colors: ["#2E477A", "#1A2E55"], category: "Gaming" },
  { id: "candycrush", name: "Candy Crush", letter: "C", colors: ["#F7941D", "#E67E10"], category: "Gaming", bundleId: "com.king.candycrushsaga" },
  { id: "clashofclans", name: "Clash of Clans", letter: "C", colors: ["#4CAF50", "#388E3C"], category: "Gaming", bundleId: "com.supercell.magic" },
  { id: "callofdutym", name: "Call of Duty", letter: "C", colors: ["#333333", "#1A1A1A"], category: "Gaming", bundleId: "com.activision.callofduty.shooter" },
  { id: "pokemongo", name: "Pokemon GO", letter: "P", colors: ["#F7D02C", "#E6BF1A"], category: "Gaming", bundleId: "com.nianticlabs.pokemongo" },
  { id: "genshin", name: "Genshin Impact", letter: "G", colors: ["#4F7CAC", "#3A6090"], category: "Gaming", bundleId: "com.miHoYo.GenshinImpact" },
  { id: "steam", name: "Steam", letter: "S", colors: ["#1B2838", "#0E1621"], category: "Gaming", bundleId: "com.valvesoftware.Steam" },
  { id: "appstore_games", name: "App Store Games", letter: "G", colors: ["#5856D6", "#AF52DE"], category: "Gaming" },

  // ── Shopping ──
  { id: "amazon", name: "Amazon", letter: "A", colors: ["#FF9900", "#E68A00"], category: "Shopping", bundleId: "com.amazon.Amazon" },
  { id: "ebay", name: "eBay", letter: "e", colors: ["#E53238", "#C42A2F"], category: "Shopping", bundleId: "com.ebay.iphone" },
  { id: "shein", name: "Shein", letter: "S", colors: ["#000000", "#1A1A1A"], category: "Shopping", bundleId: "com.zzkko" },
  { id: "temu", name: "Temu", letter: "T", colors: ["#F26522", "#D45518"], category: "Shopping", bundleId: "com.einnovation.temu" },
  { id: "walmart", name: "Walmart", letter: "W", colors: ["#0071CE", "#005AA0"], category: "Shopping", bundleId: "com.walmart.electronics" },
  { id: "target", name: "Target", letter: "T", colors: ["#CC0000", "#AA0000"], category: "Shopping", bundleId: "com.target.socsav" },
  { id: "etsy", name: "Etsy", letter: "E", colors: ["#F56400", "#D65800"], category: "Shopping", bundleId: "com.etsy.EtsyInc" },
  { id: "nike", name: "Nike", letter: "N", colors: ["#111111", "#000000"], category: "Shopping", bundleId: "com.nike.onenikecommerce" },
  { id: "doordash", name: "DoorDash", letter: "D", colors: ["#FF3008", "#E02B07"], category: "Shopping", bundleId: "com.doordash.enterprise.customers" },
  { id: "ubereats", name: "Uber Eats", letter: "U", colors: ["#06C167", "#05A858"], category: "Shopping", bundleId: "com.ubercab.UberEats" },
  { id: "grubhub", name: "Grubhub", letter: "G", colors: ["#F63440", "#D92D37"], category: "Shopping", bundleId: "com.grubhub.GHConsumer" },
  { id: "instacart", name: "Instacart", letter: "I", colors: ["#43B02A", "#379023"], category: "Shopping", bundleId: "com.instacart.client" },

  // ── Dating ──
  { id: "tinder", name: "Tinder", letter: "T", colors: ["#FE3C72", "#FF655B"], category: "Dating", bundleId: "com.cardify.tinder" },
  { id: "bumble", name: "Bumble", letter: "B", colors: ["#FFC629", "#E6B024"], category: "Dating", bundleId: "com.bumble.app" },
  { id: "hinge", name: "Hinge", letter: "H", colors: ["#000000", "#1A1A1A"], category: "Dating", bundleId: "co.hinge.app" },
  { id: "grindr", name: "Grindr", letter: "G", colors: ["#F8C73E", "#E6B635"], category: "Dating", bundleId: "com.grindrapp.ios" },

  // ── Browsers ──
  { id: "safari", name: "Safari", letter: "S", colors: ["#006CFF", "#0050D0"], category: "Browser", bundleId: "com.apple.mobilesafari" },
  { id: "chrome", name: "Chrome", letter: "C", colors: ["#4285F4", "#34A853"], category: "Browser", bundleId: "com.google.chrome.ios" },
  { id: "firefox", name: "Firefox", letter: "F", colors: ["#FF7139", "#E65C2E"], category: "Browser", bundleId: "org.mozilla.ios.Firefox" },
  { id: "brave", name: "Brave", letter: "B", colors: ["#FB542B", "#E04422"], category: "Browser", bundleId: "com.brave.ios.browser" },
  { id: "opera", name: "Opera", letter: "O", colors: ["#FF1B2D", "#D91626"], category: "Browser", bundleId: "com.opera.OperaGX" },
  { id: "edge", name: "Edge", letter: "E", colors: ["#0078D7", "#005FAA"], category: "Browser", bundleId: "com.microsoft.msedge" },

  // ── News / Reading ──
  { id: "applenews", name: "Apple News", letter: "N", colors: ["#FA2D48", "#D9263E"], category: "News", bundleId: "com.apple.news" },
  { id: "flipboard", name: "Flipboard", letter: "F", colors: ["#E12828", "#C42222"], category: "News", bundleId: "com.flipboard.flipboard-ipad" },
  { id: "medium", name: "Medium", letter: "M", colors: ["#000000", "#1A1A1A"], category: "News", bundleId: "com.medium.reader" },
  { id: "kindle", name: "Kindle", letter: "K", colors: ["#FF9900", "#E68A00"], category: "News", bundleId: "com.amazon.Lassen" },
  { id: "substack", name: "Substack", letter: "S", colors: ["#FF6719", "#E65C16"], category: "News", bundleId: "com.substack.app" },

  // ── Productivity ──
  { id: "mail", name: "Mail", letter: "M", colors: ["#007AFF", "#0060CC"], category: "Productivity", bundleId: "com.apple.mobilemail" },
  { id: "gmail", name: "Gmail", letter: "G", colors: ["#EA4335", "#D93628"], category: "Productivity", bundleId: "com.google.Gmail" },
  { id: "outlook", name: "Outlook", letter: "O", colors: ["#0078D4", "#005EA6"], category: "Productivity", bundleId: "com.microsoft.Office.Outlook" },
  { id: "photos", name: "Photos", letter: "P", colors: ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#5AC8FA", "#007AFF"], category: "Productivity", bundleId: "com.apple.mobileslideshow" },
  { id: "tiktokshop", name: "TikTok Shop", letter: "T", colors: ["#000000", "#EE1D52"], category: "Shopping", bundleId: "com.zhiliaoapp.musically" },
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
