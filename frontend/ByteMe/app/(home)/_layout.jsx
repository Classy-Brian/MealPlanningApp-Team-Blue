import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeRecipeDetails from './homerecipedetails';
import PantrySuggestionDetails from './pantrysuggestiondetails';


const Stack = createStackNavigator();

export default function HomeLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="homerecipedetails" component={HomeRecipeDetails} />
        <Stack.Screen name="pantrysuggestiondetails" component={PantrySuggestionDetails} />
    </Stack.Navigator>
  );
}
