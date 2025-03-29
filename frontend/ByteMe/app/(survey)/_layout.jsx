import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import WelcomeSurvey from './survey_1'
import SurveyAllergies from './survey_2'
import SurveyFinal from './survey_final'
import { createStackNavigator } from '@react-navigation/stack'
import { styles } from '@/components/Sheet'


const Stack = createStackNavigator();

const _layout = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="survey1" 
            component={WelcomeSurvey} />
          <Stack.Screen 
            name="survey2" 
            component={SurveyAllergies} />
          <Stack.Screen 
            name="surveyfinal" 
            component={SurveyFinal} />
      </Stack.Navigator>
  )
}

export default _layout