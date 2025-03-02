import TabBar from '@/components/TabBar';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from "expo-router";
import React from 'react'

export default function TabLayout() {
    return (
        <Tabs 
            tabBar={props=> <TabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home'
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: 'Calendar'
                }}
            />
            <Tabs.Screen
                name="savedrecipes"
                options={{
                    title: 'Recipe'
                }}
            />
            <Tabs.Screen
                name="grocery"
                options={{
                    title: 'Grocery'
                }}
            />
            <Tabs.Screen
                name="pantry"
                options={{
                    title: 'Pantry'
                }}
            />
        </Tabs>
    )
}