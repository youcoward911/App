const { withDangerousMod } = require("@expo/config-plugins");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Standard iPhone app icon sizes that Apple's App Store upload validator
// expects to find as actual PNGs inside the bundle. The 120x120 entry in
// particular is required ("iPhone / iPod Touch app icon 60pt @2x") — its
// absence causes error 90022 during eas submit.
const PHONE_ICONS = [
  { size: "20x20", scale: "2x", px: 40 },
  { size: "20x20", scale: "3x", px: 60 },
  { size: "29x29", scale: "2x", px: 58 },
  { size: "29x29", scale: "3x", px: 87 },
  { size: "40x40", scale: "2x", px: 80 },
  { size: "40x40", scale: "3x", px: 120 },
  { size: "60x60", scale: "2x", px: 120 },
  { size: "60x60", scale: "3x", px: 180 },
];

// Expo SDK 54 writes Contents.json in the Xcode 14+ single-size format
// ({"idiom": "universal", "platform": "ios", "size": "1024x1024"}), but
// EAS's actool compiles this into an Assets.car where the entry is tagged
// with idiom "phone" and there is no "ios-marketing" slot. App Store
// Connect extracts the store listing icon from the "ios-marketing" slot,
// so without it the build shows a blank icon in App Store Connect.
//
// This plugin rewrites AppIcon.appiconset/Contents.json in the classic
// pre-Xcode-14 format with an explicit "ios-marketing" idiom entry.
// actool has always understood this format and will produce a correct
// marketing slot in Assets.car.
function withAppIcon(config) {
  return withDangerousMod(config, [
    "ios",
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot;

      const iconRel =
        (mod.ios && mod.ios.icon) || mod.icon || "./assets/icon.png";
      const srcIcon = path.resolve(projectRoot, iconRel);

      if (!fs.existsSync(srcIcon)) {
        console.warn(`[withAppIcon] source icon not found at ${srcIcon}`);
        return mod;
      }

      const xcassetsParent = findXcassetsDir(platformRoot);
      if (!xcassetsParent) {
        console.warn("[withAppIcon] could not locate Images.xcassets");
        return mod;
      }

      const appiconset = path.join(xcassetsParent, "AppIcon.appiconset");
      if (!fs.existsSync(appiconset)) {
        fs.mkdirSync(appiconset, { recursive: true });
      }

      // Wipe existing appiconset contents and start fresh
      for (const entry of fs.readdirSync(appiconset)) {
        fs.unlinkSync(path.join(appiconset, entry));
      }

      // Copy the 1024x1024 source icon in as the marketing image
      const marketingFile = "App-Icon-1024x1024@1x.png";
      fs.copyFileSync(srcIcon, path.join(appiconset, marketingFile));

      // Generate scaled iPhone icons via sips (available on macOS where
      // EAS iOS builds run). Each scaled file is referenced as a "phone"
      // idiom entry so actool emits real PNGs at the required pixel sizes
      // — Apple's upload validator wants an actual 120x120 iPhone app
      // icon in the bundle, which a single 1024 universal entry does not
      // produce. The explicit ios-marketing entry then produces the App
      // Store Connect listing icon slot.
      const images = [];
      for (const { size, scale, px } of PHONE_ICONS) {
        const filename = `App-Icon-${size}@${scale}.png`;
        execFileSync("sips", [
          "-z",
          String(px),
          String(px),
          srcIcon,
          "--out",
          path.join(appiconset, filename),
        ]);
        images.push({ size, idiom: "iphone", filename, scale });
      }
      images.push({
        size: "1024x1024",
        idiom: "ios-marketing",
        filename: marketingFile,
        scale: "1x",
      });

      const contents = {
        images,
        info: { version: 1, author: "xcode" },
      };
      fs.writeFileSync(
        path.join(appiconset, "Contents.json"),
        JSON.stringify(contents, null, 2)
      );

      console.log(
        `[withAppIcon] rewrote AppIcon.appiconset with ios-marketing idiom → ${appiconset}`
      );

      return mod;
    },
  ]);
}

function findXcassetsDir(platformRoot) {
  if (!fs.existsSync(platformRoot)) return null;
  const entries = fs.readdirSync(platformRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(platformRoot, entry.name, "Images.xcassets");
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

module.exports = withAppIcon;
