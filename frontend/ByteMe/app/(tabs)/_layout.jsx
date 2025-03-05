import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { useNavigation } from 'expo-router'; // Import navigation hook

import HomeW from "@/assets/images/home_white.png";
import CalendarW from "@/assets/images/calendar_white.png";
import PantryW from "@/assets/images/pantry_white.png";
import RecipeW from "@/assets/images/recipe_white.png";
import GroceryW from "@/assets/images/grocery_white.png";

import HomeB from "@/assets/images/home_black.png"; 
import CalendarB from "@/assets/images/calendar_black.png"; 
import PantryB from "@/assets/images/pantry_black.png"; 
import RecipeB from "@/assets/images/recipe_black.png"; 
import GroceryB from "@/assets/images/grocery_black.png";




import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.navContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === index;
        const Icon = getTabIcon(route.name, isActive);

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => navigation.navigate(route.name)}
          >
            {Icon}
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getTabIcon = (name, isActive) => {
  const iconColor = isActive ? '#fff' : '#aaa';

  switch (name) {
    case 'home':
      return <Image source={HomeB} style={styles.iconImage} />;
    case 'calendar':
      return <Image source={CalendarB} style={styles.iconImage} />;
    case 'recipe':
      return <Image source={RecipeB} style={styles.iconImage} />;
    case 'grocery':
      return <Image source={GroceryB} style={styles.iconImage} />;
    case 'pantry':
      return <Image source={PantryB} style={styles.iconImage} />;
    default:
      return null; // No default, avoids unwanted fallback
  }
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs    
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', headerShown: true }} />
      <Tabs.Screen name="recipe" options={{ title: 'Recipe', headerShown: true }} />
      <Tabs.Screen name="grocery" options={{ title: 'Grocery', headerShown: true }} />
      <Tabs.Screen name="pantry" options={{ title: 'Pantry', headerShown: true }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#D7D9ED',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    alignItems: 'center',
    padding: 10,
  },
  activeTab: {
    backgroundColor: '#9A9FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  activeLabel: {
    color: '#0065EA',
  },
  profileButton: {
    marginRight: 15,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
  },
  logo: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  iconImage: {
    width: 30,
    height: 30,
  },
});
