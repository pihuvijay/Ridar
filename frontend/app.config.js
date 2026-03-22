require("dotenv").config({ path: require("path").resolve(process.cwd(), ".env") });

export default {
  expo: {
    name: "frontend",
    slug: "frontend",
    scheme: "ridar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/RidarLogo.jpeg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/RidarLogo.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.leno4.frontend",
      infoPlist: {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
      package: "com.nt785.frontend",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/RidarLogo.jpeg"
    },
    extra: {
      eas: {
        projectId: "2cb42736-584b-428e-8a9a-8d20b0efe6d6"
      }
    },
    plugins: [
      "expo-secure-store",
      [
        "react-native-maps",
        {
          "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      ]
    ]
  }
};