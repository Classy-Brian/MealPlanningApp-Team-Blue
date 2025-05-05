import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeRecipeDetails from './homerecipedetails';


const Stack = createStackNavigator();

export default function HomeLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="homerecipedetails" component={HomeRecipeDetails} />
    </Stack.Navigator>
  );
}
