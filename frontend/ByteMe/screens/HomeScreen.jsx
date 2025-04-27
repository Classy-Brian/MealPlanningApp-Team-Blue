import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, ImageBackground, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import { styles } from '../components/Sheet'

const forwardButton = require('../assets/images/forwardbutton.png')
foodImgExample = require('../assets/images/food_example.jpg')

const placeholderRecipes = [
    { id: '1', title: "Ploughman's Sandwich", image: foodImgExample },
    { id: '2', title: "Shrimp Scampi", image: foodImgExample },
    { id: '3', title: "Chicken Salad", image: foodImgExample },
    { id: '4', title: "Veggie Wrap", image: foodImgExample },
];

const placeholderMealPlan = [
    { meal: 'Breakfast', time: '7:00 AM', recipeName: 'Ricotta Pancakes', calories: 342, icon: '☀️' }, // Example icon
    { meal: 'Lunch', time: '1:00 PM', recipeName: 'Whole-Wheat Veggie Wrap', calories: 362, icon: '🌤️' }, // Example icon
    { meal: 'Dinner', time: '6:30 PM', recipeName: 'Mongolian Beef', calories: 843, icon: '🌙' }, // Example icon
];

const HomeScreen = () => {
    const [userName, setUserName] = useState(null);
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);
    const router = useRouter();

    // --- New state variables ---
    const [mealPlan, setMealPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // --- New state variables ---

    useEffect(() => {
        const getTokenAndSetupAxios = async () => {
            let storedToken = null;
            try {
                storedToken = await AsyncStorage.getItem('authToken');
                if (storedToken) {
                    setToken(storedToken);
                    setAxiosInstance(() => axios.create({
                        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }));
                } else {
                    console.log("No token found on home screen.");
                    setUserName(null);
                    router.replace('/(start)/login');
                }
            } catch (error) {
                console.error("Error getting token:", error);
                setError("Failed to load session."); 
                Alert.alert("Error", "Failed to load authentication token.");
            }
        };
        getTokenAndSetupAxios();
    }, []); 

    // --- New function to call backend API ---

    const fetchAiMealPlan = async () => {
        console.log("Frontend: Attempting to fetch AI meal plan...");
        setIsLoading(true);
        setError(null);
        setMealPlan(null);

        if (!axiosInstance) {
            console.error("Frontend: Axios instance not ready.");
            setError("Session data is not ready. Please try again shortly.");
            setIsLoading(false);
            Alert.alert("Error", "Session data is not ready. Please try again shortly.");
            return;
        }

        try {
            const response = await axiosInstance.post('/api/ai/generate-structured-plan');
            console.log("Frontend: AI Plan fetched successfully!", response.data);

            if (response.data && response.data.generatedPlan) {
                setMealPlan(response.data.generatedPlan);
            } else {
                console.error("Frontend: Generated plan data missing in response:", response.data);
                throw new Error("Received plan data in unexpected format from server.");
            }

        } catch (err) {
            console.error("Frontend: Error fetching AI plan:", err);
            let message = "An error occurred while generating the plan.";
            if (err.response && err.response.data && err.response.data.error) {
                message = err.response.data.error;
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
            setMealPlan(null);
            Alert.alert("Plan Generation Failed", message);
        } finally {
            setIsLoading(false);
            console.log("Frontend: Finished fetching AI meal plan attempt.");
        }
    };

    // --- New function to call backend API ---

    const fetchUserProfile = async () => {
        if (!axiosInstance) return;

        console.log("Fetching user profile...");

        try {
            const response = await axiosInstance.get(`/api/users/profile/${token}`);

            if (response.data && response.data.name) {
                setUserName(response.data.name);
                console.log("User name set:", response.data.name);
            } else {
                console.warn("User name not found in profile response:", response.data);
                setUserName(null);
            }
        } catch (error) { 
            console.error("Error fetching user profile:", error);

            if (error.response && error.response.status === 401) {
                 Alert.alert("Error", "Session expired. Please log in again.");
                 router.replace('/(start)/login');
            } else if (error.response && error.response.status === 404) {
                 Alert.alert("Error", "User profile not found.");
            } else {
                 Alert.alert("Error", "Could not load user data.");
            }
            setUserName(null);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [axiosInstance]); 

    const handleReciprePress = (recipe) => {
        console.log("Recipe pressed:", recipe.title);
    }

    const handleMealPress = (mealItem) => {
        console.log("Meal pressed:", mealItem.recipeName)
    }

    return (
        <ScrollView style={styles_home.container}>
            {/* Welcome Message */}
            <View style={[styles_home.welcomeContainer, {borderBottomColor: 'gray', borderBottomWidth: 1}]}>
                {userName ? (
                    <Text style={styles_home.welcomeMessage}>Welcome, {userName}!</Text> // Personalized message
                ) : (
                    <Text style={styles_home.welcomeMessage}>Welcome!</Text> // Fallback generic message
                )}
            </View>

            {/* Recipes You May Like Section */}
            <Text style={styles_home.sectionTitle}>Recipes you may like</Text>

            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles_home.horizontalRecipeList}
            >
                {placeholderRecipes.map((recipe) => (
                    <TouchableOpacity
                        key={recipe.id}
                        style={styles_home.recipeCard}
                        onPress={() => handleReciprePress(recipe)}
                    >
                        <ImageBackground
                            source={recipe.image}
                            style={styles_home.cardImage}
                            imageStyle={styles_home.cardImageStyle}
                        >
                            <View style={styles_home.cardTextOverlay}>
                                <Text style={styles_home.cardTitle}>{recipe.title}</Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles_home.discoverButton} onPress={() => router.push('/explorerecipes')}>
                <Text style={styles_home.discoverButtonText}>Discover more</Text>
            </TouchableOpacity>

            {/* --- Meal Plan for Today Section --- */}
            <Text style={styles_home.sectionTitle}>Meal Plan for Today</Text>

            {/* --- AI Button --- */}
            <TouchableOpacity
                style={localStyles.aiButton}
                onPress={fetchAiMealPlan}
                disabled={isLoading}
            >
                {/* Change text based on loading state */}
                <Text style={localStyles.aiButtonText}>
                    {isLoading ? "Generating Plan..." : "✨ Generate AI Plan for Today ✨"}
                </Text>
            </TouchableOpacity>
            {/* --- AI Button --- */}

            <View style={styles_home.mealPlanContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
                ) : error ? (
                    <Text style={localStyles.errorText}>Error: {error}</Text>
                ) : mealPlan ? (
                    <View>
                        {Object.entries(mealPlan).map(([mealType, mealData]) => {
                            let icon = '🍽️';
                            if (mealType === 'breakfast') icon = '☀️';
                            else if (mealType === 'lunch') icon = '🌤️';
                            else if (mealType === 'dinner') icon = '🌙';

                            return (
                                <View key={mealType}>
                                    {/* Meal Type Header */}
                                    <View style={styles_home.mealTypeHeader}>
                                        {/* Capitalize meal type */}
                                        <Text style={styles_home.mealTypeText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                                        <Text style={styles_home.mealTypeIcon}>{icon}</Text>
                                    </View>

                                    {/* Meal Item Card */}
                                    <TouchableOpacity
                                        style={styles_home.mealItemCard}
                                        // add onPress later to navigate to recipe URL or show details
                                        // onPress={() => {
                                        //    if(mealData.source === 'edamam' && mealData.url) {
                                        //        Linking.openURL(mealData.url); // Requires importing Linking from react-native
                                        //    } else if (mealData.suggestion) {
                                        //        Alert.alert(mealType.charAt(0).toUpperCase() + mealType.slice(1), mealData.suggestion);
                                        //    }
                                        // }}
                                    >
                                        {mealData.source === 'edamam' ? (
                                            // Display Edamam Recipe Details
                                            <>
                                                {/* Add Image for Edamam recipes */}
                                                <Image source={{ uri: mealData.imageUrl }} style={localStyles.mealImage} />
                                                <View style={styles_home.mealDetails}>
                                                    <Text style={styles_home.mealRecipeName} numberOfLines={2}>{mealData.label}</Text>
                                                    <Text style={styles_home.mealCalories}>~{mealData.calories} Calories / serving</Text>
                                                    {/* Optional: Show servings: <Text style={styles_home.mealCalories}>Yields: {mealData.servings}</Text> */}
                                                    <Text style={localStyles.mealSource}>Source: Edamam</Text>
                                                </View>
                                                <Image source={forwardButton}/>
                                            </>
                                        ) : (
                                            // Display AI Suggestion (source 'ai' or 'ai_error')
                                            // Use flex: 1 to allow text to take available space
                                            <View style={[styles_home.mealDetails, { flex: 1, marginLeft: 10 }]}>
                                                <Text style={styles_home.mealRecipeName} numberOfLines={3}>{mealData.suggestion}</Text>
                                                <Text style={localStyles.mealSource}>Source: AI Suggestion</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                        {/* Optional: Calculate and display total calories from mealPlan */}
                        {/*
                        <View style={styles_home.totalCaloriesContainer}>
                           <Text style={styles_home.totalCaloriesText}>Estimated Total Calories: CALCULATE_ME</Text>
                        </View>
                        */}
                    </View>
                ) : (
                    // Initial state before generating, or if plan is null
                    <Text style={localStyles.placeholderText}>Press the button above to generate your AI meal plan for today!</Text>
                )}
            </View>

        </ScrollView>
    );

};

const localStyles = StyleSheet.create({
    aiButton: {
        backgroundColor: colors.header,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    aiButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    mealImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: colors.lightgrey,
    },
    mealSource: {
        fontSize: 11,
        color: textcolors.grey,
        fontStyle: 'italic',
        marginTop: 4,
    },
    placeholderText: {
        textAlign: 'center',
        marginVertical: 40,
        color: textcolors.grey,
        fontSize: 16,
        paddingHorizontal: 20,
    }
});

const styles_home = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    welcomeContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'flex-start',
        minHeight: 50,
    },
    welcomeMessage: {
        fontSize: 35,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    horizontalRecipeList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    recipeCard: {
        width: 250,
        height: 160,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: colors.lightgrey,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    cardImageStyle: {
        borderRadius: 10,
    },
    cardTextOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    discoverButton: {
        backgroundColor: colors.othergrey,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 250
    },
    discoverButtonText: {
        color: textcolors.black,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    mealPlanContainer: {
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 15,
        backgroundColor: colors.lightgrey,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    mealTypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    mealTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginRight: 8,
    },
    mealTypeIcon: {
        fontSize: 18,
    },
    mealItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.othergrey,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    mealTime: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.darkgrey,
        width: 70,
        marginRight: 15,
    },
    mealDetails: {
        flex: 1,
    },
    mealRecipeName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginBottom: 3,
    },
    mealCalories: {
        fontSize: 13,
        color: textcolors.darkgrey,
        fontFamily: fonts.regular,
    },
    totalCaloriesContainer: {
        borderTopWidth: 1,
        borderTopColor: colors.othergrey,
        marginTop: 10,
        paddingTop: 10,
        alignItems: 'flex-end',
     },
    totalCaloriesText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.darkgrey,
     },
});

export default HomeScreen;