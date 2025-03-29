import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const TabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabbar}>
        {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.tabbarItem}
            accessibilityRole='button'
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <Text style={{ color: isFocused ? '#0065EA' : '#222' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
        })}
    </View>
  )
}

const styles = StyleSheet.create({
    tabbar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D7D9ED',
        marginHorizontal: 0,
        paddingVertical: 15,
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    }
})

export default TabBar