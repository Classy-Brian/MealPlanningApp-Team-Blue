import React from 'react'
import AccountSettingsScreen from './account';
import AllergySettingsScreen from './allergies';
import ConfirmDeleteScreen from './confirmdelete';
import CuisineSettingScreen from './cuisine';
import DislikedSettingsScreen from './disliked';
import PortionSettingsScreen from './portion';
import FrequencySettingsScreen from './frequency';
import PreferenceSettingsScreen from './preference';
import SettingsScreen from './settings';
import UpdatePasswordScreen from './updatepassword';
import VerifyPasswordScreen from './verifypassdelete';
import { createStackNavigator } from '@react-navigation/stack'


const Stack = createStackNavigator();

const SettingsLayout = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="settings" 
            component={SettingsScreen} />
          <Stack.Screen 
            name="account_settings" 
            component={AccountSettingsScreen} />
          <Stack.Screen 
            name="allergy_settings" 
            component={AllergySettingsScreen} />
          <Stack.Screen 
            name="confirm_delete" 
            component={ConfirmDeleteScreen} />
          <Stack.Screen 
            name="cuisine_settings" 
            component={CuisineSettingScreen} />
          <Stack.Screen 
            name="disliked_settings" 
            component={DislikedSettingsScreen} />
          <Stack.Screen 
            name="portion_settings" 
            component={PortionSettingsScreen} />
          <Stack.Screen 
            name="frequency_settings" 
            component={FrequencySettingsScreen} />
          <Stack.Screen 
            name="preference_settings" 
            component={PreferenceSettingsScreen} />
          <Stack.Screen 
            name="update_pass" 
            component={UpdatePasswordScreen} />
          <Stack.Screen 
            name="verify_pass" 
            component={VerifyPasswordScreen} />
      </Stack.Navigator>
  )
}

export default SettingsLayout