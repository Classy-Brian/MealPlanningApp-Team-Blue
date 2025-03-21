import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React from 'react'
import { Link } from "expo-router"
import { fonts } from '@/components/Fonts'
import { useFonts } from 'expo-font'

const index = () => {

  const [fontsLoaded] = useFonts({
    'Afacad-Regular': require('../assets/fonts/Afacad-Regular.ttf'),
    'Afacad-Bold': require('../assets/fonts/Afacad-Bold.ttf'),
    'Afacad-BoldItalic': require('../assets/fonts/Afacad-BoldItalic.ttf'),
    'Afacad-Italic': require('../assets/fonts/Afacad-Italic.ttf'),
    'Afacad-Medium': require('../assets/fonts/Afacad-Medium.ttf'),
    'Afacad-MediumItalic': require('../assets/fonts/Afacad-MediumItalic.ttf'),
    'Afacad-SemiBold': require('../assets/fonts/Afacad-SemiBold.ttf'),
    'Afacad-SemiBoldItalic': require('../assets/fonts/Afacad-SemiBoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color='#fff' />;
  }

  return (
    <View style={styles.container}>
      <Text style={{fontFamily: fonts.regular, fontSize: 32}}>Welcome Screen</Text>
      <Link href={"/(start)/signup"} asChild>
        <Text style={{fontSize: 18}}>Sign Up</Text>
      </Link>
      <Link href={"/(start)/login"} asChild>
        <Text style={{fontSize: 18}}>Login</Text>
      </Link>
      <Link href={"/(survey)/survey_1"} >
        <Text style={{fontSize: 18}}>Survey</Text>
      </Link>
      <Link href={"/(tabs)/home"} asChild>
        <Text style={{fontSize: 18}}>Homepage</Text>
      </Link>
      <Link href={"/(settings)/settings"}>
        <Text>Settings</Text>
      </Link>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

// import SignupScreen from "./(start)/signup";
// export default SignupScreen;

// import PantryScreen from "./(tabs)/pantry";
// export default PantryScreen;
