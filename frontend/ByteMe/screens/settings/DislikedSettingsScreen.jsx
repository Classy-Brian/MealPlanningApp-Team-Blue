import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, FlatList, Button, Alert, SafeAreaView,
    TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Keyboard, Image
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from "@react-navigation/native";

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('preference_settings')}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Preference Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const DislikedSettingsScreen = () => {
    const [dislikedIngredients, setDislikedIngredients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);

    const params = useLocalSearchParams();
    const { from } = params;
    const router = useRouter();

    useEffect(() => {
        const getToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken')
                if (storedToken) {
                    setToken(storedToken);
                    setAxiosInstance(() => axios.create({
                        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }));
                } else {
                    Alert.alert("Error", "Not logged in. Please log in first");
                }
            } catch (error) {
                console.error("Error getting tocken:", error);
                Alert.alert("Error", "Failed to load authentication token.");
            }
        };
        getToken();
    }, []);

    const fetchUserData = async () => {
        if (!axiosInstance){ 
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log("Fetching user data for dislikes");
            const response = await axiosInstance.get(`/api/users/profile/${token}`)
            const userDislikes = response.data.dislikes
            setDislikedIngredients(userDislikes)

        } catch (error) {
            console.error("Error, fetching user data:", error);
            if (err.response && error.response.status === 404) {
                Alert.alert("Error", "User profile not found.");
            } else if (err.response && error.response.status === 401) {
                Alert.alert("Error", "Unauthorized. Please log in again.");
            } else {
                Alert.alert("Error", "Could not load disliked data.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [axiosInstance]); 

    // Search Logic 
    const searchIngredients = async () => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        setSearchResults([]);
        console.log(`Searching Edamam Food DB for: "${trimmedQuery}"`);
        try {
            const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
            const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;
            if (!API_ID || !API_KEY) throw new Error("API credentials missing");

            const response = await axios.get(
                `https://api.edamam.com/api/food-database/v2/parser`,
                { params: { app_id: API_ID, app_key: API_KEY, ingr: trimmedQuery }, timeout: 10000 }
            );
            const foodData = response.data.hints.map((hint) => ({
                id: hint.food.foodId || hint.food.label, label: hint.food.label,
                category: hint.food.category, image: hint.food.image || null,
            })).filter(item => item.label);
            setSearchResults(foodData);
            console.log(`Found ${foodData.length} results.`);
        } catch (err) {
            console.error("Error searching Edamam ingredients:", err.message);
            Alert.alert("Error", "Could not search for ingredients.");
        } finally {
            setIsSearching(false);
        }
    };

    // Add Disliked Ingredients ---
    const addDislikedIngredient = (ingredientLabel) => {
        if (!dislikedIngredients.includes(ingredientLabel)) {
            setDislikedIngredients(prev => [...prev, ingredientLabel]);
        }
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
    };

    // Remove Disliked Ingredients
    const removeDislikedIngredient = (ingredientLabel) => {
        setDislikedIngredients(prev => prev.filter(item => item !== ingredientLabel));
    };

    // Save Disliked Ingredients to Backend 
    const saveDisliked = async () => {
        if (!axiosInstance) {
           Alert.alert("Error", "Session invalid. Please log in again.");
           return;
       }
       setSaving(true); // Indicate saving process
       setError(null);
       try {
           console.log("Saving disliked ingredients:", dislikedIngredients);

           await axiosInstance.patch(`/api/users/preferences`, {
               dislikes: dislikedIngredients
           });

           Alert.alert("Success", "Disliked ingredients updated successfully!");
           fetchUserData();

       } catch (err) {
           console.error("Error updating dislikes:", err);
           setError(err.message || "Failed to update disliked ingredients.");
           Alert.alert("Error", "Could not update disliked ingredients.");
       } finally {
           setSaving(false); // Finish saving process
       }
   };

   // --- Render Functions ---
   const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => addDislikedIngredient(item.label)}
        disabled={dislikedIngredients.includes(item.label)} // Disable if already disliked
    >
        <Text style={[styles.resultLabel, dislikedIngredients.includes(item.label) && styles.disabledText]}>
            {item.label}
        </Text>
         <Ionicons
            name={dislikedIngredients.includes(item.label) ? "checkmark-circle" : "add-circle-outline"}
            size={24}
            color={dislikedIngredients.includes(item.label) ? colors.grey : colors.header}
         />
    </TouchableOpacity>
    );

    const renderDislikedItem = ({ item }) => (
        <View style={styles.dislikedItem}>
            <Text style={styles.dislikedText}>{item}</Text>
            <TouchableOpacity onPress={() => removeDislikedIngredient(item)}>
                <Ionicons name="remove-circle-outline" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    if (loading && !axiosInstance) { // Initial loading or token error
        return (
             <SafeAreaView style={styles.safeArea}>
                 <View style={styles.container}>
                     <Text>{error || "Initializing..."}</Text>
                 </View>
             </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles_dislike.safeArea}>
            <ScrollView
                contentContainerStyle={styles_dislike.scrollContainer}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles_dislike.screenContainer}>
                    {/* Header */}
                    <BackButton />

                    <Text style={[styles.title, {marginTop: 10}]}>Disliked Ingredients</Text>
                    <Text style={styles_dislike.normalText}>Search for and add ingredients you want to avoid.</Text>

                    {/* Search Input and Button */}
                    <View style={styles_dislike.searchContainer}>
                        <TextInput
                            style={styles_dislike.searchInput}
                            placeholder="Search ingredient (e.g., cilantro)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchIngredients} // Trigger search on submit
                        />
                        <TouchableOpacity onPress={searchIngredients} style={styles_dislike.searchButton}>
                            {isSearching ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Ionicons name="search" size={24} color={colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Conditionally render the results container */}
                    {(isSearching || searchResults.length > 0 || (searchQuery && !isSearching && searchResults.length === 0 )) && (
                        // Container View for the results list
                        <View style={styles_dislike.searchResultsContainer}>
                            {/* Loading Indicator */}
                            {isSearching && (
                                <ActivityIndicator style={styles_dislike.resultsLoading} size="small" />
                            )}
                            {/* No Results Message */}
                            {!isSearching && searchQuery && searchResults.length === 0 && (
                                <Text style={styles_dislike.infoText}>No results found for "{searchQuery}".</Text>
                            )}
                            {searchResults.length > 0 && (
                                searchResults.map((item, index) => (
                                    <TouchableOpacity
                                        key={`${item.id}-${index}`}
                                        style={styles_dislike.searchResultItem}
                                        onPress={() => addDislikedIngredient(item.label)}
                                        disabled={dislikedIngredients.includes(item.label)}
                                    >
                                        <Text style={[styles_dislike.resultLabel, dislikedIngredients.includes(item.label) && styles_dislike.disabledText]}>
                                            {item.label}
                                        </Text>
                                        <Ionicons
                                            name={dislikedIngredients.includes(item.label) ? "checkmark-circle" : "add-circle-outline"}
                                            size={24}
                                            color={dislikedIngredients.includes(item.label) ? colors.grey : colors.header}
                                        />
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}


                    {/* List of Disliked Ingredients */}
                    <View style={styles_dislike.dislikedListContainer}>
                    <Text style={styles_dislike.dislikedListTitle}>Your Disliked Ingredients:</Text>

                    {!loading && dislikedIngredients.length === 0 && (
                        <Text style={styles_dislike.infoText}>You haven't added any disliked ingredients yet.</Text>
                    )}

                    {dislikedIngredients.length > 0 && (
                        dislikedIngredients.map((item, index) => (
                            <View key={`${item}-${index}`} style={styles_dislike.dislikedItem}>
                                <Text style={styles_dislike.dislikedText}>{item}</Text>
                                <TouchableOpacity onPress={() => removeDislikedIngredient(item)}>
                                    <Ionicons name="remove-circle-outline" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                    </View>

                    {/* Save Button Container */}
                    <View style={styles_dislike.saveButtonContainer}>
                        <Button
                            title={saving ? "Saving..." : "Save"}
                            onPress={saveDisliked}
                            color={colors.header}
                            disabled={saving || loading} // Disable while saving or initial loading
                        />
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );

};

const styles_dislike = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: { 
        flexGrow: 1, 
        paddingBottom: 50 
    },
    screenContainer: { 
        flex: 1, 
        padding: 20 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',   
        height: 40, 
        marginBottom: 20, 
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', 
        left: 0,
        top: 0,
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: colors.othergrey,
        justifyContent: 'center',
        marginVertical: 20,
        elevation: 2,
        shadowColor: colors.black,
    },
    settingsText: {
        fontSize: 20,
        marginLeft: 5,
    },
    normalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: textcolors.black, 
        textAlign: 'center', flex: 1 
    },
    subtitle: { 
        marginBottom: 20, 
        color: textcolors.darkgrey, 
        fontSize: 16, fontFamily: fonts.regular, 
        textAlign: 'center' },
    regularText: { 
        fontSize: 16, 
        color: textcolors.black, 
        fontFamily: fonts.regular 
    },
    searchContainer: { 
        flexDirection: 'row', 
        marginBottom: 10 
    },
    searchInput: { 
        flex: 1, 
        borderWidth: 1, 
        borderColor: colors.grey, 
        borderRadius: 8, 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        fontSize: 16, 
        fontFamily: fonts.regular, 
        marginRight: 10 
    },
    searchButton: { 
        backgroundColor: colors.header, 
        padding: 10, 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    infoText: { 
        textAlign: 'center', 
        color: textcolors.darkgrey, 
        marginVertical: 15, 
        fontSize: 14, 
        fontFamily: fonts.regular 
    },
    searchResultsContainer: { 
        maxHeight: 200, 
        marginBottom: 20, 
        backgroundColor: colors.white, 
        borderWidth: 1, 
        borderColor: colors.othergrey, 
        borderRadius: 8 
    },
    searchResultItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: 
        colors.lightgrey 
    },
    resultLabel: { 
        flex: 1, 
        fontSize: 16, 
        fontFamily: fonts.regular, 
        color: textcolors.black, 
        marginRight: 10 
    },
    disabledText: { 
        color: colors.grey 
    },
    dislikedListContainer: { 
        marginTop: 15, 
        paddingTop: 15, 
        borderTopWidth: 1, 
        borderTopColor: 
        colors.othergrey 
    },
    dislikedListTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        fontFamily: fonts.bold, 
        marginBottom: 10, 
        color: textcolors.black 
    },
    dislikedItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingVertical: 8, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.lightgrey 
    },
    dislikedText: { 
        fontSize: 16, 
        fontFamily: fonts.regular, 
        flex: 1, 
        marginRight: 10, 
        color: textcolors.black 
    },
    saveButtonContainer: { 
        marginTop: 20, 
        marginBottom: 20 
    },
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 },
    errorText: { 
        color: 'red', 
        textAlign: 'center', 
        marginBottom: 10 
    },
});

export default DislikedSettingsScreen;