// Patches @bacons/apple-targets to add device-activity-report extension type
const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "..", "node_modules", "@bacons", "apple-targets", "build");
const targetFile = path.join(baseDir, "target.js");
const configListFile = path.join(baseDir, "configuration-list.js");

if (!fs.existsSync(targetFile)) {
  console.log("[patch] @bacons/apple-targets not found, skipping");
  process.exit(0);
}

// --- Patch target.js ---
let content = fs.readFileSync(targetFile, "utf8");

if (!content.includes("device-activity-report")) {
  // Add to TARGET_REGISTRY
  content = content.replace(
    `"device-activity-monitor": {
        extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension",
        frameworks: ["DeviceActivity"],
        displayName: "Device Activity Monitor",
    },`,
    `"device-activity-monitor": {
        extensionPointIdentifier: "com.apple.deviceactivity.monitor-extension",
        frameworks: ["DeviceActivity"],
        displayName: "Device Activity Monitor",
    },
    "device-activity-report": {
        frameworks: ["DeviceActivity", "ManagedSettings", "FamilyControls"],
        displayName: "Device Activity Report",
    },`
  );

  // Add Info.plist case — include the NSExtensionPointIdentifier
  content = content.replace(
    `case "device-activity-monitor":
            return {
                NSExtension: {
                    NSExtensionPointIdentifier,
                    NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).DeviceActivityMonitorExtension",
                },
            };`,
    `case "device-activity-monitor":
            return {
                NSExtension: {
                    NSExtensionPointIdentifier,
                    NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).DeviceActivityMonitorExtension",
                },
            };
        case "device-activity-report":
            return {};`
  );

  fs.writeFileSync(targetFile, content);
  console.log("[patch] Patched target.js");
} else {
  console.log("[patch] target.js already patched");
}

// --- Patch configuration-list.js ---
if (fs.existsSync(configListFile)) {
  let configContent = fs.readFileSync(configListFile, "utf8");
  if (!configContent.includes("device-activity-report")) {
    // Add to the switch case so it gets build settings
    configContent = configContent.replace(
      `case "device-activity-monitor":`,
      `case "device-activity-monitor":\n        case "device-activity-report":`
    );
    fs.writeFileSync(configListFile, configContent);
    console.log("[patch] Patched configuration-list.js");
  } else {
    console.log("[patch] configuration-list.js already patched");
  }
}

// --- ExtensionKit: the report must be an ExtensionKit extension, not a legacy appex ---
// iOS refuses to install a device-activity-report built as a legacy appex with no
// NSExtension dict ("Unable to Install"). Each patch below checks its own marker so it
// also applies on top of an older patched copy.
content = fs.readFileSync(targetFile, "utf8");
if (!content.includes('com.apple.deviceactivityui.report-extension')) {
  content = content.replace(
    `"device-activity-report": {
        frameworks: ["DeviceActivity", "ManagedSettings", "FamilyControls"],`,
    `"device-activity-report": {
        productType: "com.apple.product-type.extensionkit-extension",
        frameworks: ["DeviceActivity", "ManagedSettings", "FamilyControls"],`
  );
  content = content.replace(
    `case "device-activity-report":
            return {};`,
    `case "device-activity-report":
            return {
                EXAppExtensionAttributes: {
                    EXExtensionPointIdentifier: "com.apple.deviceactivityui.report-extension",
                },
            };`
  );
  if (!content.includes('com.apple.deviceactivityui.report-extension')) {
    console.warn("[patch] WARNING: could not patch device-activity-report as ExtensionKit");
  }
  fs.writeFileSync(targetFile, content);
  console.log("[patch] device-activity-report -> ExtensionKit");
}

// ExtensionKit products are .appex bundles too; upstream names them .app
const xcodeChangesFile = path.join(baseDir, "with-xcode-changes.js");
if (fs.existsSync(xcodeChangesFile)) {
  let xc = fs.readFileSync(xcodeChangesFile, "utf8");
  const before = `path: props.name + (isExtension ? ".appex" : ".app"),`;
  if (xc.includes(before)) {
    xc = xc.replace(before, `path: props.name + (isExtension || isExtensionKit ? ".appex" : ".app"),`);
    fs.writeFileSync(xcodeChangesFile, xc);
    console.log("[patch] ExtensionKit product path -> .appex");
  }
}

console.log("[patch] Done");
