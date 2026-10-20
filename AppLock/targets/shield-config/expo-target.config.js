/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "shield-config",
  name: "ShieldConfiguration",
  bundleIdentifier: "com.paypig.app.ShieldConfiguration",
  deploymentTarget: "18.0",
  entitlements: {
    "com.apple.developer.family-controls": true,
    "com.apple.security.application-groups": ["group.com.paypig.app"],
  },
};
