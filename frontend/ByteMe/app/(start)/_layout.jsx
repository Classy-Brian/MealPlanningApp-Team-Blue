import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import LoginScreen from './login'
import SignupScreen from './signup'
import ForgotPasswordScreen from './forgotPassword'

const Stack = createStackNavigator();

const _layout = () => {
  return (
      <Stack.Navigator>
          <Stack.Screen
            name="login" 
            component={LoginScreen}
            options={{headerShown: false}} />
          <Stack.Screen 
            name="signup" 
            component={SignupScreen}
            options={{headerShown: false}} />
          <Stack.Screen 
            name="forgotpassword" 
            component={ForgotPasswordScreen}
            options={{headerShown: false}} />
      </Stack.Navigator>
  )
}

export default _layout