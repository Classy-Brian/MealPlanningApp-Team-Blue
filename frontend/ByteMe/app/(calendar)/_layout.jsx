import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddDayScreen from './addday';
import CalendarScreen from './calendar';
import EditSaveDayScreen from './editsaveday';
import SavedRecipesDupi from './savedrecipesdupi'

const Stack = createStackNavigator();

export default function CalendarLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="calendar" component={CalendarScreen} />
        <Stack.Screen name="addday" component={AddDayScreen} />
        <Stack.Screen name="editsaveday" component={EditSaveDayScreen} />
        <Stack.Screen name="savedrecipesdupi" component={SavedRecipesDupi} />
    </Stack.Navigator>
  );
}
