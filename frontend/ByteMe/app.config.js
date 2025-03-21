import 'dotenv/config';

export default {
  expo: {
    name: "byteme",
    slug: "byteme",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      softwareKeyboardLayoutMode: "pan"
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: [
      "expo-router",
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/Afacad-Bold.ttf"]
        }
      ]
      
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: '7e4893d8-072b-4d94-b691-b73fb103a9d2' 
      },
    },
    updates: {
        url: "https://u.expo.dev/7e4893d8-072b-4d94-b691-b73fb103a9d2"  
      },
      runtimeVersion: {
        policy: "appVersion"
      }
  }
};