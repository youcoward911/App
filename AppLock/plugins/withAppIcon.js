const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Expo SDK 54 prebuild generates a broken Assets.xcassets/AppIcon.appiconset
// for this project — the 1024x1024 icon is tagged as idiom "phone" instead of
// "ios-marketing", so App Store Connect can't extract the marketing icon for
// the store listing.
//
// This plugin runs after prebuild and overwrites AppIcon.appiconset with a
// proper Contents.json containing the ios-marketing slot, plus copies the
// source icon.png into the imageset so xcode builds it correctly.
function withAppIcon(config) {
  return withDangerousMod(config, [
    "ios",
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot;

      // Source icon from app.json — fall back to ./assets/icon.png
      const iconRel =
        (mod.ios && mod.ios.icon) || mod.icon || "./assets/icon.png";
      const srcIcon = path.resolve(projectRoot, iconRel);

      if (!fs.existsSync(srcIcon)) {
        console.warn(`[withAppIcon] source icon not found at ${srcIcon}`);
        return mod;
      }

      // Locate AppIcon.appiconset under ios/<ProjectName>/Images.xcassets
      // The project name is derived from app.json name; find it dynamically.
      const xcassetsParent = findXcassetsDir(platformRoot);
      if (!xcassetsParent) {
        console.warn("[withAppIcon] could not locate Images.xcassets");
        return mod;
      }

      const appiconset = path.join(xcassetsParent, "AppIcon.appiconset");
      if (!fs.existsSync(appiconset)) {
        fs.mkdirSync(appiconset, { recursive: true });
      }

      // Wipe everything in the appiconset and write our own
      for (const entry of fs.readdirSync(appiconset)) {
        fs.unlinkSync(path.join(appiconset, entry));
      }

      // Copy the 1024x1024 source
      const iconDest = path.join(appiconset, "App-Icon-1024x1024@1x.png");
      fs.copyFileSync(srcIcon, iconDest);

      // Write Contents.json with ios-marketing idiom
      const contents = {
        images: [
          {
            filename: "App-Icon-1024x1024@1x.png",
            idiom: "universal",
            platform: "ios",
            size: "1024x1024",
          },
        ],
        info: {
          author: "xcode",
          version: 1,
        },
      };
      fs.writeFileSync(
        path.join(appiconset, "Contents.json"),
        JSON.stringify(contents, null, 2)
      );

      console.log(
        `[withAppIcon] wrote AppIcon.appiconset → ${appiconset}`
      );

      return mod;
    },
  ]);
}

function findXcassetsDir(platformRoot) {
  // platformRoot is .../ios. Project folder is inside it.
  if (!fs.existsSync(platformRoot)) return null;
  const entries = fs.readdirSync(platformRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(
      platformRoot,
      entry.name,
      "Images.xcassets"
    );
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

module.exports = withAppIcon;
