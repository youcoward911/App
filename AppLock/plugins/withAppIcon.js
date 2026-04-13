const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

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
      const iconDest = path.join(appiconset, "App-Icon-1024x1024@1x.png");
      fs.copyFileSync(srcIcon, iconDest);

      // Classic Xcode 13 / pre-Xcode-14 Contents.json with explicit
      // ios-marketing idiom. actool has supported this format for years
      // and will produce a proper marketing slot in Assets.car.
      const contents = {
        images: [
          {
            size: "1024x1024",
            idiom: "ios-marketing",
            filename: "App-Icon-1024x1024@1x.png",
            scale: "1x",
          },
        ],
        info: {
          version: 1,
          author: "xcode",
        },
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
