import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeRecipeDetails from './homerecipedetails';
import HomeScreen from './home';


const Stack = createStackNavigator();

export default function HomeLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home1" component={HomeScreen} />
        <Stack.Screen name="homerecipedetails" component={HomeRecipeDetails} />
    </Stack.Navigator>
  );
}
