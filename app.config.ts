import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Hextech SEQR Loyalty",
  slug: "jcb-loyalty",
  version: "1.4.0",
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    buildNumber: "1",
    supportsTablet: false,
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      ITSAppUsesNonExemptEncryption: false
    },
    bundleIdentifier: "org.reactjs.native.example.jcb-seqr-loyality"
  },
  android: {
    versionCode: 1,
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    package: "com.jcb_seqr_loyality_new",
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
    "@react-native-community/datetimepicker",
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
          useFrameworks: "static",
          buildReactNativeFromSource: true,

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
    }
  }
});
