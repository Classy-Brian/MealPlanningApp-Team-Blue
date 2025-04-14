import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import EditPantryIngredient from './pantryedit'
import PantrySuggestions from './pantrysuggest'
import PantryScreen from './pantry'
import AddingGroceryToPantry from './addingfromgrocery'
import PantryRecipeDetailsScreen from './pantryrecipedetails'
import { createStackNavigator } from '@react-navigation/stack'
import { styles } from '@/components/Sheet'


const Stack = createStackNavigator();

const PantryLayout = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="pantry1" 
            component={PantryScreen} />
          <Stack.Screen 
            name="edit_pantry" 
            component={EditPantryIngredient} />
          <Stack.Screen 
            name="pantry_suggest" 
            component={PantrySuggestions} />
          <Stack.Screen 
          name="add_from_grocery" 
          component={AddingGroceryToPantry} />
          <Stack.Screen 
          name="pantry_recipe_details" 
          component={PantryRecipeDetailsScreen} />
      </Stack.Navigator>
  )
}

export default PantryLayout