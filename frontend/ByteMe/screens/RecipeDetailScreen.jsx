import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert, Linking } from "react-native";
import axios from "axios";
import { useLocalSearchParams } from "expo-router"; //  Use Expo Router params

const RecipeDetailScreen = () => {
    const params = useLocalSearchParams(); //  Get recipe ID from URL params
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false); //  Tracks if recipe is saved

    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    const USER_ID = "67c8da45f97986963147083a"; // testing user ID

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            if (!params.id) {
                setError("Invalid recipe ID.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.edamam.com/search?r=${encodeURIComponent(params.id)}&app_id=${API_ID}&app_key=${API_KEY}`
                );

                if (response.data.length > 0) {
                    setRecipe(response.data[0]);
                } else {
                    setError("Recipe not found.");
                }
            } catch (err) {
                console.error("Error fetching recipe details:", err);
                setError("Failed to fetch recipe details.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [params.id]);

    //  Function to Save Recipe to User Database
    const saveRecipe = async () => {
        if (!recipe) return;

        try {
            const response = await axios.post("http://localhost:5000/api/users/save-recipe", {
                userId: USER_ID, //  Replace with actual user authentication
                recipeId: params.id, //  Only send the recipe ID
            });

            if (response.status === 200) {
                setIsSaved(true);
                Alert.alert("Success", "Recipe saved successfully!");
            } else {
                throw new Error("Failed to save recipe.");
            }
        } catch (err) {
            console.error("Error saving recipe:", err);
            Alert.alert("Error", "Could not save recipe. Please try again.");
        }
    };

    if (loading) return <Text>Loading recipe details...</Text>;
    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{recipe.label}</Text>
            <Image source={{ uri: recipe.image }} style={styles.image} />

            <Button title={isSaved ? "Recipe Saved" : "Save Recipe"} onPress={saveRecipe} disabled={isSaved} />

            {/*Direction*/}
            {recipe.url && (
                <Button
                    title="View Full Recipe"
                    onPress={() => Linking.openURL(recipe.url)}
                    color="#4CAF50"
                />
            )}

            {/* Ingredients */}
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredientLines.map((ingredient, index) => (
                <Text key={index} style={styles.ingredient}>{ingredient}</Text>
            ))}

            {/* Allergy Warnings (Health Labels) */}
            {recipe.healthLabels.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Allergy Warnings</Text>
                    <View style={styles.allergyContainer}>
                        {recipe.healthLabels.map((label, index) => (
                            <Text key={index} style={styles.allergyLabel}>{label}</Text>
                        ))}
                    </View>
                </>
            )}

            {/* Nutrients */}
            <Text style={styles.sectionTitle}>Nutrients</Text>
            {recipe.totalNutrients ? (
                Object.keys(recipe.totalNutrients).map((key) => (
                    <Text key={key} style={styles.nutrient}>
                        {recipe.totalNutrients[key].label}: {Math.round(recipe.totalNutrients[key].quantity)} {recipe.totalNutrients[key].unit}
                    </Text>
                ))
            ) : (
                <Text>No nutrient data available.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
    },
    ingredient: {
        fontSize: 16,
        marginVertical: 2,
    },
    nutrient: {
        fontSize: 16,
        marginVertical: 2,
    },
    error: {
        color: "red",
    },
});

export default RecipeDetailScreen;
