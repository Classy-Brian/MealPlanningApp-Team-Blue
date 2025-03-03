import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Utensils, Calendar, ShoppingCart } from 'lucide-react-native';

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
    case 'pantry':
      return Utensils;
    case 'calander':
      return Calendar;
    case 'grocery':
      return ShoppingCart;
    default:
      return Home;
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
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="pantry" options={{ title: 'Pantry' }} />
      <Tabs.Screen name="calander" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="grocery" options={{ title: 'Grocery' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    alignItems: 'center',
    padding: 10,
  },
  activeTab: {
    backgroundColor: '#0F1056',
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