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

    useEffect(() => {
        const loadUserPantry = async () => {
            await generateUserIngrLabels()
        }
        loadUserPantry()
    }, [])

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

            <View style={styles_home.mealPlanContainer}>
                {placeholderMealPlan.map((item, index) => (
                <View key={index}>
                    {/* Meal Type Header (e.g., Breakfast, Lunch) */}
                    <View style={styles_home.mealTypeHeader}>
                    <Text style={styles_home.mealTypeText}>{item.meal}</Text>
                    <Text style={styles_home.mealTypeIcon}>{item.icon}</Text>
                    </View>
                    {/* Meal Item Card */}
                    <TouchableOpacity style={styles_home.mealItemCard} onPress={() => handleMealPress(item)}>
                    <Text style={styles_home.mealTime}>{item.time}</Text>
                    <View style={styles_home.mealDetails}>
                        <Text style={styles_home.mealRecipeName}>{item.recipeName}</Text>
                        <Text style={styles_home.mealCalories}>Calories: {item.calories}</Text>
                    </View>
                    <Image source={forwardButton}/>
                    </TouchableOpacity>
                </View>
                ))}
                <View style={styles_home.totalCaloriesContainer}>
                    <Text style={styles_home.totalCaloriesText}>Total Calories: 1,547</Text>
                </View>
            </View>

        </ScrollView>
    );

};

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