import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Home, Utensils, Calendar, ShoppingCart } from 'lucide-react-native';
import Pantry from "@/assets/images/Pantry.png";
import Recipe from "@/assets/images/recipe.png";
import ByteMeLogo from "@/assets/images/byteme_logo_logo.png"; // Import the ByteMe logo
import ProfileIcon from "@/assets/images/profile_icon.png"; // Import the profile icon

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
    case 'Home':
      return Home;
    case 'Calendar':
      return Calendar;
    case 'Recipe':
      return () => <Image source={Recipe} style={{ width: 30, height: 30 }} />;
    case 'Grocery':
      return ShoppingCart;
    case 'Pantry':
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
        headerStyle: { backgroundColor: '#1F508F' }, // Set header background color
        headerTitle: () => (
          <Image source={ByteMeLogo} style={{ width: 100, height: 30, resizeMode: 'contain' }} />
        ), // ByteMe logo in center
        headerRight: ({ navigation }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')} // Navigate to Profile screen
            style={styles.profileButton}
          >
            <Image source={ProfileIcon} style={styles.profileImage} />
          </TouchableOpacity>
        ), // Profile button in top right
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', headerShown: true }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', headerShown: true }} />
      <Tabs.Screen name="recipe" options={{ title: 'Recipe', headerShown: true }} />
      <Tabs.Screen name="grocery" options={{ title: 'Grocery', headerShown: true }} />
      <Tabs.Screen name="pantry" options={{ title: 'Pantry', headerShown: true }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: true }} />
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
  profileButton: {
    marginRight: 15,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50, // Makes it a circle
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
