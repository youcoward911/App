/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "device-activity-monitor",
  name: "DeviceActivityMonitor",
  bundleIdentifier: "com.paypig.app.DeviceActivityMonitor",
  deploymentTarget: "18.0",
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": ["group.com.paypig.app"],
  },
};
