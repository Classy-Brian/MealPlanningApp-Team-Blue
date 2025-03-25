import { Image, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router'; // Use Stack from expo-router
import { colors } from "../components/Colors";
import SavedRecipesScreen from "@/screens/recipe/SavedRecipesScreen"; // This will be handled by the router

function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}
      />
    </View>
  );
}

function ProfileIcon() {
  return (
    <TouchableOpacity onPress={() => router.push('/profile')}>
      <Image
        source={require('../assets/images/profile.png')}
        style={styles.profileImage}
      />
    </TouchableOpacity>
  );
}

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      {/* Do not include SavedRecipesScreen directly in the Stack.Screen. 
          Just refer to the name and routing will handle the screen. */}
      <Stack.Screen
        name="(tabs)/savedrecipes"  // Make sure this matches the file structure
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      {/* Other screens */}
      <Stack.Screen
        name="(start)"
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="(survey)"
        options={{headerShown: false}}
      />
      <Stack.Screen
        name='index'
        options={{headerShown: false}}
      />
      <Stack.Screen
        name='explorerecipes'
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name='recipedetails'
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name='favoriterecipes'
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <Stack.Screen name="add_recipe"
        options={{
          headerShown: true,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      <Stack.Screen name="recipe_details"
        options={{
          headerShown: true,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
  </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stretch: {
    width: 120,
    height: 50,
    resizeMode: 'stretch',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10, // optional, to space it nicely from the edge
    borderWidth: 1,
    borderColor: colors.white,
  },
});

export default _layout;
