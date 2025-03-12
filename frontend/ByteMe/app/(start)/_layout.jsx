import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import LoginScreen from './login'
import SignupScreen from './signup'
import ForgotPasswordScreen from './forgotPassword'
import WelcomeSurvey from '../(survey)/survey_1'
import Homepage from '../(tabs)/home'

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
          <Stack.Screen 
          name="survey1" 
          component={WelcomeSurvey}
          options={{headerShown: false}} />
          <Stack.Screen 
          name="home" 
          component={Homepage}
          options={{headerShown: false}} />
      </Stack.Navigator>
  )
}

export default _layout