const { withXcodeProject, withEntitlementsPlist } = require("@expo/config-plugins");

// This config plugin sets up the project for Screen Time API.
// The FamilyControls entitlement is commented out until Apple approves it.
// To enable: uncomment the entitlement line below after approval.

function withScreenTime(config) {
  // 1. FamilyControls entitlement — enabled
  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults["com.apple.developer.family-controls.application"] = true;
    return mod;
  });

  // 2. Set minimum iOS deployment target to 16.0 (Screen Time API requirement)
  config = withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const buildConfigs = project.pbxXCBuildConfigurationSection();

    for (const key in buildConfigs) {
      const cfg = buildConfigs[key];
      if (cfg.buildSettings) {
        cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "16.0";
      }
    }
    return mod;
  });

  return config;
}

module.exports = withScreenTime;
