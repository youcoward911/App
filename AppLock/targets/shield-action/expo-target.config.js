/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "shield-action",
  name: "ShieldAction",
  bundleIdentifier: "com.paypig.app.ShieldAction",
  deploymentTarget: "18.0",
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": ["group.com.paypig.app"],
  },
};
