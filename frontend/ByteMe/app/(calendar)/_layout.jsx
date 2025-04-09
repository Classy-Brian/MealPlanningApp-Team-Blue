import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AddDayScreen from './addday';
import CalendarScreen from './calendar';
import EditSaveDayScreen from './editsaveday';

const Stack = createStackNavigator();

export default function GroceryLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="calendar" component={CalendarScreen} />
        <Stack.Screen name="addday" component={AddDayScreen} />
        <Stack.Screen name="editsaveday" component={EditSaveDayScreen} />
    </Stack.Navigator>
  );
}
