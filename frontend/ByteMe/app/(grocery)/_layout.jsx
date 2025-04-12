import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GroceryScreen from './grocery';
import EditGroceryIngredientScreen from './editgroceryingredient';
import AddGroceryIngredientScreen from './addgroceryingredient';

const Stack = createStackNavigator();

export default function GroceryLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="grocery" component={GroceryScreen} />
      <Stack.Screen name="editgroceryingredient" component={EditGroceryIngredientScreen} />
      <Stack.Screen name="addgroceryingredient" component={AddGroceryIngredientScreen} />
    </Stack.Navigator>
  );
}
