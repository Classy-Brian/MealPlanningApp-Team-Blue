import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Appbar, Avatar, Button, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

// Sample Data for Saved Recipes
const sampleRecipes = [
    { id: "1", title: "Spaghetti Bolognese", category: "Italian" },
    { id: "2", title: "Chicken Curry", category: "Indian" },
    { id: "3", title: "Caesar Salad", category: "Salad" },
    { id: "4", title: "Beef Tacos", category: "Mexican" },
];

// Saved Recipes Screen
const SavedRecipesScreen = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [recipes, setRecipes] = useState(sampleRecipes);

    // Search Filter Logic
    const filteredRecipes = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <Appbar.Header style={styles.navBar}>
                <TouchableOpacity onPress={() => alert("Menu Clicked!")}>
                    <Icon name="menu" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Saved Recipes</Text>
                <TouchableOpacity onPress={() => alert("Profile Clicked!")}>
                    <Avatar.Image size={35} source={{ uri: "https://via.placeholder.com/150" }} />
                </TouchableOpacity>
            </Appbar.Header>

            {/* Search Bar */}
            <Searchbar
                placeholder="Search for your recipes"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                icon="magnify"
            />

            {/* Filter Button */}
            <Button mode="contained" onPress={() => alert("Filter Clicked!")} style={styles.filterButton}>
                Filter by Category & Ingredients
            </Button>

            {/* Recipe List */}
            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.recipeItem} onPress={() => alert(`Viewing ${item.title}`)}>
                        <Text style={styles.recipeText}>{item.title}</Text>
                        <Text style={styles.recipeCategory}>{item.category}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === "Home") iconName = "home";
                        else if (route.name === "Calendar") iconName = "calendar";
                        else if (route.name === "Recipes") iconName = "book";
                        else if (route.name === "Grocery") iconName = "cart";
                        else if (route.name === "Pantry") iconName = "basket";
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#3498db",
                    tabBarInactiveTintColor: "gray",
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Home" component={SavedRecipesScreen} />
                <Tab.Screen name="Calendar" component={SavedRecipesScreen} />
                <Tab.Screen name="Recipes" component={SavedRecipesScreen} />
                <Tab.Screen name="Grocery" component={SavedRecipesScreen} />
                <Tab.Screen name="Pantry" component={SavedRecipesScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    navBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#3498db",
        paddingHorizontal: 15,
    },
    navTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    searchBar: {
        margin: 10,
        borderRadius: 10,
    },
    filterButton: {
        marginHorizontal: 10,
        marginBottom: 10,
        backgroundColor: "#2ecc71",
    },
    recipeItem: {
        backgroundColor: "#fff",
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    recipeText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    recipeCategory: {
        fontSize: 14,
        color: "#777",
    },
});

export default App;
