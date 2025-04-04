import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import LoginScreen from './login'
import SignupScreen from './signup'
import ForgotPasswordScreen from './forgotPassword'
import VerifyCodeScreen from './verifyCode'
import NewPasswordScreen from './newPassword'

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
            component={ForgotPasswordScreen} />
          <Stack.Screen 
            name="verifycode" 
            component={VerifyCodeScreen} />
          <Stack.Screen 
            name="newpassword" 
            component={NewPasswordScreen} />
      </Stack.Navigator>
  )
}

export default _layout