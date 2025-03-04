import { Image, View, Text, Button, StyleSheet } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'
import { colors } from "../components/Colors"
// import { createStackNavigator } from '@react-navigation/stack'


function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const _layout = () => {
  return (
    <Stack>
        <Stack.Screen name="(tabs)"
          options={{
            headerShown: true,
            headerTitle: () => <HeaderLogo />,
            headerStyle: {
              backgroundColor: colors.header
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            }} />
    </Stack>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', 
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stretch: {
    width: 120,
    height: 50,
    resizeMode: 'stretch',
  }
})

export default _layout