/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "device-activity-report",
  name: "DeviceActivityReportExtension",
  bundleIdentifier: "com.paypig.app.DeviceActivityReport",
  deploymentTarget: "16.0",
  entitlements: {
    "com.apple.developer.family-controls": true,
  },
};
