import React from 'react'
import AddGoalsScreen from './addgoals';
import CalorieGoalScreen from './caloriegoal';
import EditProfileScreen from './editprofile';
import NewRecipesGoalScreen from './newrecipesgoal';
import ProfileScreen from './profile';
import { createStackNavigator } from '@react-navigation/stack'


const Stack = createStackNavigator();

const ProfileLayout = () => {
  return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="add_goals" 
            component={AddGoalsScreen} />
          <Stack.Screen 
            name="calorie_goal" 
            component={CalorieGoalScreen} />
          <Stack.Screen 
            name="edit_profile" 
            component={EditProfileScreen} />
            <Stack.Screen 
            name="new_recipe_goal" 
            component={NewRecipesGoalScreen} />
            <Stack.Screen 
            name="profile" 
            component={ProfileScreen} />
      </Stack.Navigator>
  )
}

export default ProfileLayout