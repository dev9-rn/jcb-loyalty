const { withAndroidManifest } = require("@expo/config-plugins");

const BLOCKED_PERMISSIONS = [
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.FOREGROUND_SERVICE_CAMERA",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
];

module.exports = function withRemovePermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    BLOCKED_PERMISSIONS.forEach((permName) => {
      manifest["uses-permission"] = manifest["uses-permission"].filter(
        (p) => p.$?.["android:name"] !== permName
      );

      manifest["uses-permission"].push({
        $: {
          "android:name": permName,
          "tools:node": "remove",
        },
      });
    });

    return config;
  });
};