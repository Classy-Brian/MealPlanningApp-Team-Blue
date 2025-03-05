import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from "expo-router"

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Welcome Screen</Text>
      <Link href={"/(start)/signup"} asChild>
        <Text>Sign Up</Text>
      </Link>
      <Link href={"/(start)/login"} asChild>
        <Text>Login</Text>
      </Link>
      <Link href={"/(survey)/welcomeSurvey"} asChild>
        <Text>Survey</Text>
      </Link>
      <Link href={"/(tabs)"} asChild>
        <Text>Homepage</Text>
      </Link>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    }
})