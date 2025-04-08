import {
    StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, SafeAreaView,
    TextInput, FlatList, ActivityIndicator, Image, Keyboard
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; 

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');
const nextArrowImage = require('../../assets/images/next_arrow_navigate.png');
const nextButtonImage = require('../../assets/images/next_arrow.png');

function NextButton() {
  return (
    <View >
      <Image source={nextButtonImage}/>
    </View>
  )
}

const SurveyDislikedIngredientsScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]); // To store results from Edamam
    const [dislikedIngredients, setDislikedIngredients] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Loading indicator for search

    useEffect(() => {
        const loadDislikes = async () => {
            try {
                const savedDislikes = await AsyncStorage.getItem('dislikes'); 
                if (savedDislikes !== null) {
                    const parsedDislikes = JSON.parse(savedDislikes);
                    if (Array.isArray(parsedDislikes) && parsedDislikes.every(item => typeof item === 'string')) {
                        setDislikedIngredients(parsedDislikes);
                    } else {
                        console.warn("Invalid dislikes data found in storage");
                        await AsyncStorage.removeItem('dislikes');
                    }
                }
            } catch (err) {
            console.error("Failed to load dislikes from storage", err);
            }
            };
        loadDislikes();
    }, []);

    const nextPage = async () => {
        await AsyncStorage.setItem('dislikes', JSON.stringify(dislikedIngredients));
        navigation.navigate('surveyfinal', { dislikedIngredients });
    };

    const prevPage = async () => {
        await AsyncStorage.setItem('dislikes', JSON.stringify(dislikedIngredients));
        navigation.navigate('survey4', { dislikedIngredients });
    }

    // Ingredient Search Logic
    const searchIngredients = async () => {
        if (!searchQuery.trim()) return; // Don't search if query is empty

        setIsSearching(true);
        setSearchResults([]); // Clear previous results
        console.log(`Searching Edamam Food DB for: "${searchQuery}"`);

        try {
            const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
            const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;

            if (!API_ID || !API_KEY) {
                console.error("Missing Edamam Food DB API credentials in .env");
                 Alert.alert("Configuration Error", "Food database credentials missing.");
                setIsSearching(false);
                return;
            }

            const response = await axios.get(
                `https://api.edamam.com/api/food-database/v2/parser`,
                {
                    params: {
                        app_id: API_ID,
                        app_key: API_KEY,
                        ingr: searchQuery,
                        // Can add category filters if needed, e.g., category: 'generic-foods', maybe for later
                    },
                    timeout: 10000, // 10 second timeout
                }
            );

            // Process results
            const foodData = response.data.hints.map((hint) => {
                const food = hint.food;
                return {
                    // Use foodId as a unique key if available, otherwise label
                    id: food.foodId || food.label,
                    label: food.label,
                    category: food.category,
                    image: food.image || null, // null if no image
                };
            }).filter(item => item.label); // Ensure items have a label

            setSearchResults(foodData);
             console.log(`Found ${foodData.length} results.`);

        } catch (err) {
            console.error("Error searching Edamam ingredients:", err.message);
            if (err.code === 'ECONNABORTED') {
                 Alert.alert("Error", "Search timed out. Please try again.");
            } else {
                 Alert.alert("Error", "Could not search for ingredients.");
            }
        } finally {
            setIsSearching(false);
        }
    };

    // Add Disliked Ingredients 
    const addDislikedIngredient = (ingredientLabel) => {
        // Check if the ingredient is NOT already in the list
        if (!dislikedIngredients.includes(ingredientLabel)) {
            setDislikedIngredients(prev => [...prev, ingredientLabel]); 
        }
        setSearchQuery(''); // Clear search after adding
        setSearchResults([]); // Clear results after adding
        Keyboard.dismiss(); // Dismiss keyboard
   };

   // Remove Disliked Ingredients 
    const removeDislikedIngredient = (ingredientLabel) => {
        setDislikedIngredients(prev => prev.filter(item => item !== ingredientLabel));
   };

    // Render Functions 
    const renderSearchResultItem = ({ item }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => addDislikedIngredient(item.label)}
        >
            {/* ... */}
            <Text style={styles.resultLabel}>{item.label}</Text>
            <Ionicons name="add-circle-outline" size={24} color={colors.header} />
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

    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Use ScrollView because content might overflow */}
             <ScrollView
                 contentContainerStyle={styles.scrollContainer}
                 keyboardShouldPersistTaps='handled' // Dismiss keyboard when tapping outside input
             >
                <View style={styles.screenContainer}>

                    {/* Header buttons */}
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={prevPage}>
                            <View style={styles.greybutton}>
                                <Ionicons name="arrow-back" size={20} color={textcolors.black} style={{ marginRight: 5 }} />
                                <Text style={styles.regularText}>Cuisine</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextPage}>
                            <View style={styles.greybutton}>
                                <Text style={[styles.regularText, { marginRight: 5 }]}>Skip</Text>
                                <Ionicons name="arrow-forward" size={20} color={textcolors.black} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.title, { marginTop: 10 }]}>Disliked Ingredients</Text>
                    <Text style={[styles.regularText, styles.subtitle]}>
                        Search for and add any ingredients you want to avoid.
                    </Text>

                    {/* Search Input and Button */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search ingredient (e.g., cilantro)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchIngredients} // Trigger search on submit
                        />
                        <TouchableOpacity onPress={searchIngredients} style={styles.searchButton}>
                            {isSearching ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Ionicons name="search" size={24} color={colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search Results List */}
                    {isSearching && searchResults.length === 0 && (
                        <Text style={styles.infoText}>Searching...</Text>
                    )}
                    {!isSearching && searchQuery && searchResults.length === 0 && (
                         <Text style={styles.infoText}>No results found for "{searchQuery}".</Text>
                    )}
                     {searchResults.length > 0 && (
                        <View style={styles.searchResultsList}>
                            {searchResults.map((item, index) => ( 
                                <TouchableOpacity
                                    key={`${item.id}-${index}`}
                                    style={styles.searchResultItem}
                                    onPress={() => addDislikedIngredient(item.label)}
                                >
                                    <Text style={styles.resultLabel}>{item.label}</Text>
                                    <Ionicons name="add-circle-outline" size={24} color={colors.header} />
                                </TouchableOpacity>
                            ))}
                        </View>
                     )}


                    {/* List of Disliked Ingredients */}
                    {dislikedIngredients.length > 0 && (
                        <View style={styles.dislikedListContainer}>
                            <Text style={styles.dislikedListTitle}>Your Disliked Ingredients:</Text>
                            {dislikedIngredients.map((item, index) => (
                                 <View key={index} style={styles.dislikedItem}>
                                     <Text style={styles.dislikedText}>{item}</Text>
                                     <TouchableOpacity onPress={() => removeDislikedIngredient(item)}>
                                          <Ionicons name="remove-circle-outline" size={24} color="red" />
                                     </TouchableOpacity>
                                 </View>
                             ))}
                        </View>
                    )}

                </View>
            </ScrollView>

            {/* Floating Next Button */}
            <TouchableOpacity onPress={nextPage} style={styles.nextButtonContainer}>
                <View style={[styles.nextbutton, {right: 0, top: 0, transform:[{translateX: 60}, {translateY: 75}]}]}>
                <NextButton />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 150,
    },
    screenContainer: {
        flex: 1,
        padding: 20,
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 48,
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginBottom: 5,
    },
    subtitle: {
        marginBottom: 20,
        color: textcolors.darkgrey,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    regularText: {
        fontSize: 16,
        color: textcolors.black,
        fontFamily: fonts.regular,
    },
    greybutton: {
        flexDirection: 'row',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: colors.othergrey,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
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
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: colors.header,
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
     infoText: {
        textAlign: 'center',
        color: textcolors.darkgrey,
        marginVertical: 10,
    },
    searchResultsList: {
        maxHeight: 200,
        marginBottom: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.othergrey,
        borderRadius: 8,
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightgrey,
    },
    resultLabel: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.regular,
    },
    // resultIcon: { 
    //     width: 30,
    //     height: 30,
    //     marginRight: 10,
    //     borderRadius: 4,
    // },
     dislikedListContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.othergrey,
        paddingTop: 15,
    },
    dislikedListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        marginBottom: 10,
    },
    dislikedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightgrey,
    },
    dislikedText: {
        fontSize: 16,
        fontFamily: fonts.regular,
        flex: 1, // Allow text to take space
        marginRight: 10,
    },
    nextButtonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    nextbutton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#91A9C8',
        height: 170,
        width: 170,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
});

const button = StyleSheet.create({
    nextbutton: {
        borderRadius: 100,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#91A9C8',
        height: 170,
        width: 170,
        position: 'absolute',
        elevation: 2,
        shadowColor: colors.black,
        
    },
});

export default SurveyDislikedIngredientsScreen