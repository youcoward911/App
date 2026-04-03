const { withXcodeProject, withEntitlementsPlist, withInfoPlist } = require("@expo/config-plugins");

// This config plugin adds the FamilyControls entitlement and
// embeds the ScreenTimeModule into the Xcode project at prebuild time.

function withScreenTime(config) {
  // 1. Add FamilyControls entitlement
  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults["com.apple.developer.family-controls.application"] = true;
    return mod;
  });

  // 2. Set minimum iOS deployment target to 16.0 (Screen Time API requirement)
  config = withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const targetId = project.getFirstTarget().uuid;
    const buildConfigs = project.pbxXCBuildConfigurationSection();

    for (const key in buildConfigs) {
      const config = buildConfigs[key];
      if (config.buildSettings) {
        config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "16.0";
      }
    }
    return mod;
  });

  return config;
}

module.exports = withScreenTime;
