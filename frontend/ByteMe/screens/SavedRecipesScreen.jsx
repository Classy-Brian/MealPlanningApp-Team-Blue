import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const savedRecipesScreen = ({ navigation }) => {
    const [query, setQuery] = useState("");
    const [recipes, setRecipes] = useState([]); //Searched Recipes
    const [savedRecipes, setSavedRecipes] = useState([]); //User'S Saved Recipes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    const USER_ID = "67c8da45f97986963147083a"; // testing 
    
    const fetchSavedRecipes = async () => {
        setLoading(true);
        try{
            const response = await axios.get(`http://localhost:5000/api/users/${USER_ID}/get-saved-recipes`);
            console.log("Response Data:", response.data); // Debugging
            
            if (!response.data) {
                console.warn("No saved recipes found in response.");
                setSavedRecipes([]);
                setLoading(false);
                return;
            }
    
            const savedRecipe = response.data;
            console.log("Saved Recipe URIs:", savedRecipe);

            //Fetch full recipe details from Edamam API
            const recipeDetailsPromises = savedRecipe.map((uri) =>
                axios.get(`https://api.edamam.com/search?r=${encodeURIComponent(uri)}&app_id=${API_ID}&app_key=${API_KEY}`)
            );

            const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
            const detailedRecipes = recipeDetailsResponses.map(res => res.data[0]); // Extract first item from each response

            console.log("Fetched Recipe Details:", detailedRecipes); // Debugging

            setSavedRecipes(detailedRecipes);
            setError(null);
        } catch (err){
            console.error("Error fetching saved recipes:", err);
            setError("Failed to load saved recipes.");
            Alert.alert("Error", "Could not load saved recipes.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSavedRecipes();
    }, []);

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return <Text style={styles.error}>{error}</Text>;

    // Fetch recipes from Edamam API based on query
    const searchRecipes = async () => {
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
            <Text style={styles.title}>Saved Recipes</Text>
            <TextInput
                style={styles.input}
                placeholder="Search for more recipes"
                value={query}
                onChangeText={setQuery}
            />
            <Button title="Search" onPress={searchRecipes} />

            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}

            {/*  Display Saved Recipes */}
            <Text style={styles.sectionTitle}>Your Saved Recipes</Text>
            {savedRecipes.length === 0 ? (
                <Text style={styles.noRecipes}>No saved recipes found.</Text>
            ) : (
                <FlatList
                    data={savedRecipes}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.recipeItem}
                            onPress={() =>
                                router.push(`../non-tab/recipe-detail?id=${encodeURIComponent(item.uri)}&label=${encodeURIComponent(item.label)}&image=${encodeURIComponent(item.image)}`)
                            }
                        >
                            <Image source={{ uri: item.image }} style={styles.recipeImage} />
                            <Text style={styles.recipeTitle}>{item.label}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* ✅ Display Searched Recipes */}
            {recipes.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Search Results</Text>
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
                </>
            )}
        </View>
    );
};


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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
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
    noRecipes: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        marginTop: 20,
    },
});

export default savedRecipesScreen;
