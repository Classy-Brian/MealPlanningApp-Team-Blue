import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image  } from 'react-native';
import { Home, Utensils, Calendar, ShoppingCart } from 'lucide-react-native';
import Pantry from "@/assets/images/Pantry.png";
import Recipe from "@/assets/images/recipe.png";


import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.navContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === index;
        const Icon = getTabIcon(route.name);

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => navigation.navigate(route.name)}
          >
            <Icon color={isActive ? '#fff' : '#aaa'} size={24} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {options.title || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getTabIcon = (name) => {
  switch (name) {
    case 'home':
      return Home;
    case 'calander':
      return Calendar;
    case 'Recipe':
      return () => <Image source={Recipe} style={{ width: 30, height: 30 }} />;
    case 'grocery':
      return ShoppingCart;
    case 'pantry':
      return () => <Image source={Pantry} style={{ width: 30, height: 30 }} />;
    default:
      return () => <Image source={Recipe} style={{ width: 30, height: 30 }} />; // Fallback icon for debugging
  }
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="Home" options={{ title: 'Home' }} />
      <Tabs.Screen name="Calander" options={{ title: 'Calander' }} />
      <Tabs.Screen name="Recipe" options={{ title: 'Recipe' }} />
      <Tabs.Screen name="Grocery" options={{ title: 'Grocery' }} />
      <Tabs.Screen name="Pantry" options={{ title: 'Pantry' }} />
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
    color: '#aaa',
    marginTop: 4,
  },
  activeLabel: {
    color: '#0065EA',
  },
});