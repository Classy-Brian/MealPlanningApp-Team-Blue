import React from 'react'
import ExploreRecipesScreen from './explorerecipes'
import FavoriteRecipesScreen from './favoriterecipes'
import RecipeDetailsScreen from './recipedetails'
import SavedRecipesScreen from './savedrecipes'
import ChatBot from './aiscreen'
import { createStackNavigator } from '@react-navigation/stack'


const Stack = createStackNavigator();

const RecipeLayout = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="savedrecipes" 
            component={SavedRecipesScreen} />
          <Stack.Screen 
            name="recipe_details" 
            component={RecipeDetailsScreen} />
          <Stack.Screen 
            name="favorite_recipe" 
            component={FavoriteRecipesScreen} />
          <Stack.Screen 
          name="explore_recipe" 
          component={ExploreRecipesScreen} />
          <Stack.Screen 
            name="chat_bot" 
            component={ChatBot} />
      </Stack.Navigator>
  )
}

export default RecipeLayout