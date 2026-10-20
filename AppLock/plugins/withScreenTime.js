const {
  withXcodeProject,
  withEntitlementsPlist,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const TEAM_ID = "78KK2B4DTZ";

const NATIVE_FILES = [
  "ScreenTimeModule.swift",
  "ScreenTimeModule.m",
  "AppPickerViewController.swift",
  "SharedDefaults.swift",
  "SelectedAppsView.swift",
  "SelectedAppsViewManager.swift",
  "SelectedAppsViewManager.m",
  "AppIconsRowView.swift",
  "AppIconsRowViewManager.swift",
  "AppIconsRowViewManager.m",
  "DeviceActivityReportView.swift",
  "DeviceActivityReportViewManager.m",
];

// Extension targets are handled by @bacons/apple-targets via targets/*/expo-target.config.js

// Extensions that read the App Group state get a copy of SharedDefaults.swift
// (single source in ios-native/ScreenTimeModule; the copies are gitignored)
const SHARED_DEFAULTS_TARGETS = ["shield-action", "shield-config", "activity-monitor"];

function withScreenTime(config) {
  // 1. Family Controls entitlement — always enabled
  config = withEntitlementsPlist(config, (mod) => {
    mod.modResults["com.apple.developer.family-controls"] = true;
    // Remove push notification entitlement — not needed
    delete mod.modResults["aps-environment"];
    return mod;
  });
  console.log("[withScreenTime] Family Controls entitlement ENABLED");

  // 2. Copy native module files into the app target
  config = withDangerousMod(config, [
    "ios",
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot;
      const nativeDir = path.join(projectRoot, "ios-native");
      const appName = findAppName(platformRoot);

      if (!appName) {
        console.warn("[withScreenTime] could not find app target directory");
        return mod;
      }

      const appDir = path.join(platformRoot, appName);
      const stmDir = path.join(nativeDir, "ScreenTimeModule");

      for (const file of NATIVE_FILES) {
        const src = path.join(stmDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(appDir, file));
        }
      }

      for (const target of SHARED_DEFAULTS_TARGETS) {
        const targetDir = path.join(projectRoot, "targets", target);
        if (fs.existsSync(targetDir)) {
          fs.copyFileSync(path.join(stmDir, "SharedDefaults.swift"), path.join(targetDir, "SharedDefaults.swift"));
        }
      }

      // Ensure bridging header imports React
      const bridgingHeader = path.join(appDir, `${appName}-Bridging-Header.h`);
      if (fs.existsSync(bridgingHeader)) {
        let content = fs.readFileSync(bridgingHeader, "utf8");
        if (!content.includes("RCTBridgeModule")) {
          content += '\n#import <React/RCTBridgeModule.h>\n#import <React/RCTEventEmitter.h>\n';
          fs.writeFileSync(bridgingHeader, content);
        }
      }

      // Patch Podfile
      const podfile = path.join(platformRoot, "Podfile");
      if (fs.existsSync(podfile)) {
        let content = fs.readFileSync(podfile, "utf8");

        const teamPatch = `
    # Set DEVELOPMENT_TEAM on all targets to fix Xcode 14+ resource bundle signing
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['DEVELOPMENT_TEAM'] = '${TEAM_ID}'
      end
    end`;
        content = content.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|${teamPatch}`
        );
        fs.writeFileSync(podfile, content);
      }

      // DeviceActivityReport extension target is handled by @bacons/apple-targets
      // from targets/report/ — no manual copying needed here.

      console.log("[withScreenTime] copied native module files + patched Podfile");
      return mod;
    },
  ]);

  // 2. Add native files to Xcode project + set build settings
  config = withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const appName = findAppNameFromProject(project);

    // Add each native file to the main target's compile sources
    for (const file of NATIVE_FILES) {
      const filePath = `${appName}/${file}`;
      project.addSourceFile(filePath, null, project.getFirstProject().firstProject.mainGroup);
    }

    // Set deployment target + team on all build configs
    const buildConfigs = project.pbxXCBuildConfigurationSection();
    for (const key in buildConfigs) {
      const cfg = buildConfigs[key];
      if (cfg.buildSettings) {
        cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = "18.0";
        cfg.buildSettings.DEVELOPMENT_TEAM = TEAM_ID;
        // Ensure Swift bridging header is set
        if (cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === "com.paypig.app") {
          cfg.buildSettings.SWIFT_OBJC_BRIDGING_HEADER = `${appName}/${appName}-Bridging-Header.h`;
        }
      }
    }

    // Extension target is created by @bacons/apple-targets from targets/report/

    console.log("[withScreenTime] added native source files to Xcode project");
    return mod;
  });

  return config;
}

function findAppName(platformRoot) {
  if (!fs.existsSync(platformRoot)) return null;
  const entries = fs.readdirSync(platformRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      !entry.name.endsWith(".xcodeproj") &&
      !entry.name.endsWith(".xcworkspace") &&
      entry.name !== "Pods" &&
      entry.name !== "build"
    ) {
      if (
        fs.existsSync(path.join(platformRoot, entry.name, "AppDelegate.mm")) ||
        fs.existsSync(path.join(platformRoot, entry.name, "AppDelegate.m")) ||
        fs.existsSync(path.join(platformRoot, entry.name, "AppDelegate.swift"))
      ) {
        return entry.name;
      }
    }
  }
  return null;
}

function findAppNameFromProject(project) {
  const mainTarget = project.getFirstTarget();
  if (mainTarget && mainTarget.firstTarget) {
    return mainTarget.firstTarget.name.replace(/"/g, "");
  }
  return "ScrollPig";
}

module.exports = withScreenTime;
