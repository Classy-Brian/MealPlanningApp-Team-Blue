import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import WelcomeSurvey from './survey_1'
import SurveyAllergies from './survey_2'
import SurveyFinal from './survey_final'
import { createStackNavigator } from '@react-navigation/stack'
import LoginScreen from '../(start)/login'


const Stack = createStackNavigator();

const _layout = () => {
  return (
      <Stack.Navigator>
          <Stack.Screen 
            name="survey1" 
            component={WelcomeSurvey}
            options={{headerShown: false}} />
          <Stack.Screen 
            name="survey2" 
            component={SurveyAllergies} 
            options={{headerShown: false}} />
          <Stack.Screen 
            name="surveyfinal" 
            component={SurveyFinal}
            options={{headerShown: false}} />
            <Stack.Screen 
            name="login" 
            component={LoginScreen}
            options={{headerShown: false}} />
      </Stack.Navigator>
  )
}

export default _layout