export default { 
    expo: {
      name: "byteme",
      slug: "byteme",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "myapp",
      userInterfaceStyle: "automatic",
      newArchEnabled: true, 
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff"
        }
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
      },
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff"
          }
        ]
      ],
      experiments: {
        typedRoutes: true
      },
      extra: {
        eas: {
          projectId: '8150e5d4-8cd0-4c80-b8f6-d7d3e69f3b6b' // Replace with *actual* projectId later!
        },
        proxy: "http://192.168.1.65:5005" // Proxy configuration
      },
       updates: {
          url: "https://u.expo.dev/8150e5d4-8cd0-4c80-b8f6-d7d3e69f3b6b"  
        },
        runtimeVersion: {
        policy: "appVersion"
        }
  
    }
  };