import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from "expo-router"

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 32}}>Welcome Screen</Text>
      <Link href={"/(start)/signup"} asChild>
        <Text style={{fontSize: 18}}>Sign Up</Text>
      </Link>
      <Link href={"/(start)/login"} asChild>
        <Text style={{fontSize: 18}}>Login</Text>
      </Link>
      <Link href={"/(survey)/survey_1"} asChild>
        <Text style={{fontSize: 18}}>Survey</Text>
      </Link>
      <Link href={"/(tabs)/home"} asChild>
        <Text style={{fontSize: 18}}>Homepage</Text>
      </Link>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})