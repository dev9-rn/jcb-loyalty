import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Daewoo Lubricants",
  slug: "daewoo-seqr-loyalty",
  version: "1.2.2",
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    buildNumber: "7",
    supportsTablet: false,
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      ITSAppUsesNonExemptEncryption: false
    },
    bundleIdentifier: "com.daewoo.seqrloyalty"
  },
  android: {
    versionCode: 7,
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    package: "com.daewoo.seqrloyalty",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO"
    ]
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./src/assets/images/favicon.png"
  },
  plugins: [
    "@react-native-firebase/app",
    // "@react-native-firebase/auth",
    "@react-native-firebase/crashlytics",
    "expo-router",
    "expo-audio",
    "expo-font",
    "expo-web-browser",
    [
    "expo-splash-screen",
    {
      image: "./src/assets/images/splash-icon.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    }
    ],
    [
      "expo-dev-client",
      {
        launchMode: "most-recent"
      }
    ],
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        }
      }
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to scan coupon QR codes",
        recordAudioAndroid: false
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends."
      }
    ],
    [
      "expo-notifications",
      {
        icon: "./src/assets/images/notification_icon.png",
        // color: "#ffffff",
        defaultChannel: "default",
        enableBackgroundRemoteNotifications: false
      }
    ],
    [
      "expo-localization"
    ],
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    supportsRTL: true,
    router: {
      origin: false
    },
    eas: {
      projectId: "5390f040-20ce-47a1-bdd8-0a60d5da2a6b"
    }
  },
  owner: "kaustubh-scube"
});
