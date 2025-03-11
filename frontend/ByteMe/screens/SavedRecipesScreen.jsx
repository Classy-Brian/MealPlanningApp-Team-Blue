import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const RecipeSearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;

    // Fetch recipes from Edamam API based on query
    const fetchRecipes = async () => {
        if (!query.trim()) {
            alert("Please enter a search term.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `https://api.edamam.com/search?q=${query}&app_id=${API_ID}&app_key=${API_KEY}`
            );
            setRecipes(response.data.hits);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            setError("Failed to fetch recipes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Recipes</Text>
            <TextInput
                style={styles.input}
                placeholder="Search recipe"
                value={query}
                onChangeText={setQuery}
            />
            <Button title="Search" onPress={fetchRecipes} />

            {loading && <Text>Loading recipes...</Text>}
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.recipe.uri}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.recipeItem}
                        onPress={() =>
                            router.push(`../non-tab/recipe-detail?id=${encodeURIComponent(item.recipe.uri)}&label=${encodeURIComponent(item.recipe.label)}&image=${encodeURIComponent(item.recipe.image)}`)
                        }
                    >
                        <Image source={{ uri: item.recipe.image }} style={styles.recipeImage} />
                        <Text style={styles.recipeTitle}>{item.recipe.label}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f8f8",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
    recipeItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    recipeImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    recipeTitle: {
        fontSize: 16,
    },
});

export default RecipeSearchScreen;
