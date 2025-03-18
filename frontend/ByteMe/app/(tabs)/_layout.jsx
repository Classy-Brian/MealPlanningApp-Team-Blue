import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
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

import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';



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
            style={[styles.tab]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Animatable.View style={styles.iconContainer}>
              {isActive ? (
                <LinearGradient
                  colors={['#0F1056', '#9A9FFF']}
                  start={{x: 0, y: 1}}
                  end={{x: 1, y:0}}
                  style={styles.activeTab}
                >
                  {Icon}
                </LinearGradient>
              ) : (
                <>
                  {Icon}
                </>
              )}
            </Animatable.View>
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
  const iconColor = isActive ? '#fff' : '#505050';
  const w = isActive ? 45 : 40;
  const h = isActive ? 45 : 40;

  switch (name) {
    case 'home':
      return <Image source={isActive ? HomeW : HomeB} style={[styles.iconImage, {tintColor: iconColor, width: w, height: h}]} />;
    case 'calendar':
      return <Image source={isActive ? CalendarW : CalendarB} style={[styles.iconImage, {tintColor: iconColor, width: w, height: h}]} />;
    case 'recipe':
      return <Image source={isActive ? RecipeW : RecipeB} style={[styles.iconImage, {tintColor: iconColor, width: w, height: h}]} />;
    case 'grocery':
      return <Image source={isActive ? GroceryW : GroceryB} style={[styles.iconImage, {tintColor: iconColor, width: w, height: h}]} />;
    case 'pantry':
      return <Image source={isActive ? PantryW : PantryB} style={[styles.iconImage, {tintColor: iconColor, width: w, height: h}]} />;
    default:
      return null; // No default, avoids unwanted fallback
  }
};

export default function TabLayout() {

  return (
    <Tabs    
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', headerShown: false }} />
      <Tabs.Screen name="recipe" options={{ title: 'Recipe', headerShown: false }} />
      <Tabs.Screen name="grocery" options={{ title: 'Grocery', headerShown: false }} />
      <Tabs.Screen name="pantry" options={{ title: 'Pantry', headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#D7D9ED',
    paddingVertical: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: 80,
  },
  activeTab: {
    borderRadius: 200,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    width: 70,
    borderColor: '#D7D9ED',
    borderWidth: 5,

  },
  label: {
    fontSize: 14,
    color: '#505050',
    marginTop: 4,
  },
  activeLabel: {
    color: '#0065EA',
    fontWeight: 'bold',
    transform: [{translateY: 5}]
  },
  logo: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  iconImage: {
    resizeMode: 'contain',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  }
});
