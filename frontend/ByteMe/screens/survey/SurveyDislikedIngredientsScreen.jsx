import {
    Text, View, Alert, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Image, Keyboard, SafeAreaView
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { styles, styles_survey, styles_buttons } from '@/components/Sheet'

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
    const [searchResults, setSearchResults] = useState([]);
    const [dislikedIngredients, setDislikedIngredients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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
        navigation.navigate('survey6');
    };

    const prevPage = async () => {
        await AsyncStorage.setItem('dislikes', JSON.stringify(dislikedIngredients));
        navigation.navigate('survey4');
    }

    const skipPage = async () => {
        try {
          await AsyncStorage.removeItem('dislikes');
          navigation.navigate('survey6');
        } catch (e) {
          console.error("Failed to handle skip dislikes", e);
          Alert.alert("Error", "Could not skip this step");
        }
    };

    // Ingredient Search Logic
    const searchIngredients = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);
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
                    },
                    timeout: 10000,
                }
            );

            const foodData = response.data.hints.map((hint) => {
                const food = hint.food;
                return {
                    id: food.foodId || food.label,
                    label: food.label,
                    category: food.category,
                    image: food.image || null,
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

    const addDislikedIngredient = (ingredientLabel) => {
        if (!dislikedIngredients.includes(ingredientLabel)) {
            setDislikedIngredients(prev => [...prev, ingredientLabel]); 
        }
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
    };

    const removeDislikedIngredient = (ingredientLabel) => {
        setDislikedIngredients(prev => prev.filter(item => item !== ingredientLabel));
    };

    return (
        <SafeAreaView style={styles.whiteBackground}>
        <View style={styles.whiteBackground}>
            <View style={styles.screenContainer}>
                
                {/* Use ScrollView because content might overflow */}
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps='handled'
                >

                    {/* Header buttons */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={prevPage}>
                            <View style={styles.greybutton}>
                            <Image style={{marginRight:10}} source={backArrowImage}/>
                            <Text style={styles.regularText}>Cuisines</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipPage}>
                            <View style={[styles.greybutton, {justifyContent: 'space-between'}]}>
                            <Text style={[styles.regularText, {marginRight:10}]}>Skip</Text>
                            <Image source={nextArrowImage}/>            
                            </View>
                        </TouchableOpacity>          
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { marginTop: 10 }]}>Disliked Ingredients</Text>
                    <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
                        Search for and add any ingredients you want to avoid.
                    </Text>

                    {/* Search Input and Button */}
                    <View style={styles_survey.searchContainer}>
                        <TextInput
                            style={styles_survey.searchInput}
                            placeholder="Search ingredient (e.g., cilantro)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={searchIngredients} // Trigger search on submit
                        />
                        <TouchableOpacity onPress={searchIngredients} style={styles_buttons.searchButton}>
                            {isSearching ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Ionicons name="search" size={24} color={colors.white} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Search Results List */}
                    {isSearching && searchResults.length === 0 && (
                        <Text style={styles_survey.infoText}>Searching...</Text>
                    )}
                    {!isSearching && searchQuery && searchResults.length === 0 && (
                         <Text style={styles_survey.infoText}>No results found for "{searchQuery}".</Text>
                    )}
                     {searchResults.length > 0 && (
                        <View style={styles_survey.searchResultsList}>
                            {searchResults.map((item, index) => ( 
                                <TouchableOpacity
                                    key={`${item.id}-${index}`}
                                    style={styles_survey.searchResultItem}
                                    onPress={() => addDislikedIngredient(item.label)}
                                >
                                    <Text style={styles_survey.resultLabel}>{item.label}</Text>
                                    <Ionicons name="add-circle-outline" size={24} color={colors.header} />
                                </TouchableOpacity>
                            ))}
                        </View>
                     )}


                    {/* List of Disliked Ingredients */}
                    {dislikedIngredients.length > 0 && (
                        <View style={styles_survey.dislikedListContainer}>
                            <Text style={styles_survey.dislikedListTitle}>Your Disliked Ingredients:</Text>
                            {dislikedIngredients.map((item, index) => (
                                 <View key={index} style={styles_survey.dislikedItem}>
                                     <Text style={styles_survey.dislikedText}>{item}</Text>
                                     <TouchableOpacity onPress={() => removeDislikedIngredient(item)}>
                                          <Ionicons name="remove-circle-outline" size={24} color="red" />
                                     </TouchableOpacity>
                                 </View>
                             ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Floating Next Button */}
            <TouchableOpacity onPress={nextPage}>
                <View style={[styles_buttons.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 265}]}]}>
                    <NextButton />
                </View>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
};

export default SurveyDislikedIngredientsScreen