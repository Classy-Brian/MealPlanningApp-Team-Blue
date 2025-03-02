import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'light'}} >
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