import {
    StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, SafeAreaView,
    TextInput, FlatList, ActivityIndicator, Image, Keyboard
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { Ionicons } from '@expo/vector-icons'; 
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

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

const SurveyCalories = ({ navigation }) => {
    const [minCalories, setMinCalories] = useState('');
    const [maxCalories, setMaxCalories] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadCalories = async () => {
            try {
                const savedCaloriesJSON = await AsyncStorage.getItem('surveyCalories');
                if (savedCaloriesJSON !== null) {
                    const savedCalories = JSON.parse(savedCaloriesJSON);

                    if (savedCalories.min !== undefined) {
                        setMinCalories(savedCalories.min.toString());
                    }
                    if (savedCalories.max !== undefined) {
                        setMaxCalories(savedCalories.max.toString());
                    }
                }
            } catch (e) {
                console.error("Failed to load calories from storage", e);
            }
        };
        loadCalories();
    }, []);

    const validateInput = () => {
        const minVal = parseInt(minCalories, 10);
        const maxVal = parseInt(maxCalories, 10);

        // if (!minCalories.trim() || !maxCalories.trim()) {
        //     Alert.alert("Input Needed", "Please enter both minimum and maximum calorie goals.");
        //     return null;
        // }
        // if (isNaN(minVal) || isNaN(maxVal)) {
        //     Alert.alert("Invalid Input", "Please enter valid numbers for calories.");
        //     return null;
        // }
        // if (minVal < 0 || maxVal < 0) {
        //     Alert.alert("Invalid Input", "Calorie goals cannot be negative.");
        //     return null;
        // }
        // if (minVal >= maxVal) {
        //     Alert.alert("Invalid Input", "Maximum calories must be greater than minimum calories.");
        //     return null;
        // }

        return { min: minVal, max: maxVal };
    }

    const nextPage = async () => {
        const validatedCalories = validateInput();
        if (!validatedCalories) return;

        setIsSaving(true);

        try {
            await AsyncStorage.setItem('surveyCalories', JSON.stringify(validatedCalories));
            navigation.navigate('surveyfinal', { validatedCalories });
        } catch (e) {
            console.error("Failed to save calories", e);
            Alert.alert("Error", "Could not save your selections.");
        } finally {
            setIsSaving(false);
        }
    };

    const prevPage = async () => {
        const validatedCalories = validateInput();
        if (validatedCalories) {
             try {
                 await AsyncStorage.setItem('surveyCalories', JSON.stringify(validatedCalories));
             } catch(e) {
                 console.error("Failed to save calories on back navigation", e);
             }
        }
        navigation.navigate('survey5');
    };

    const skipPage = async () => {
        setIsSaving(true);
        try {
            await AsyncStorage.removeItem('surveyCalories');
            navigation.navigate('surveyfinal');
        } catch (e) {
            console.error("Failed to handle skip calories", e);
            Alert.alert("Error", "Could not skip this step");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles_calories.safeArea}>
            <ScrollView
                contentContainerStyle={styles_calories.scrollContainer}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles_calories.screenContainer}>

                    {/* Header buttons */}
                    <View style={styles_calories.headerButtons}>
                        <TouchableOpacity onPress={prevPage} disabled={isSaving}>
                            <View style={styles_calories.greybutton}>
                                <Ionicons name="arrow-back" size={20} color={textcolors.black} style={{ marginRight: 5 }} />
                                <Text style={styles_calories.regularText}>Disliked Ingredients</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipPage} disabled={isSaving}>
                            <View style={styles_calories.greybutton}>
                                <Text style={[styles_calories.regularText, { marginRight: 5 }]}>Skip</Text>
                                <Ionicons name="arrow-forward" size={20} color={textcolors.black} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles_calories.title, { marginTop: 10 }]}>Calorie Goal</Text>
                    <Text style={[styles_calories.regularText, styles_calories.subtitle]}>
                        Set your target daily calorie intake range.
                    </Text>

                    {/* Input Fields */}
                    <View style={styles_calories.inputGroup}>
                        <View style={styles_calories.inputContainer}>
                            <Text style={styles_calories.label}>Minimum Daily Calories</Text>
                            <TextInput
                                style={styles_calories.input}
                                placeholder="e.g., 1500"
                                placeholderTextColor={textcolors.lightgrey}
                                value={minCalories}
                                onChangeText={setMinCalories}
                                keyboardType="number-pad"
                                returnKeyType="next"
                                maxLength={5}
                            />
                        </View>

                        <View style={styles_calories.inputContainer}>
                            <Text style={styles_calories.label}>Maximum Daily Calories</Text>
                            <TextInput
                                style={styles_calories.input}
                                placeholder="e.g., 2500"
                                placeholderTextColor={textcolors.lightgrey}
                                value={maxCalories}
                                onChangeText={setMaxCalories}
                                keyboardType="number-pad"
                                returnKeyType="done" 
                                onSubmitEditing={nextPage} 
                                maxLength={5}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Floating Next Button */}
            <TouchableOpacity onPress={nextPage} style={styles_calories.nextButtonContainer} disabled={isSaving}>
                <View style={[styles_calories.nextbutton, isSaving && styles_calories.buttonDisabled]}>
                    {isSaving ? <ActivityIndicator color={colors.white}/> : <NextButton />}
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );

};

const styles_calories = StyleSheet.create({
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
        marginBottom: 30,
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
    inputGroup: {
        marginVertical: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: textcolors.darkgrey,
        marginBottom: 8,
        fontFamily: fonts.regular,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.grey,
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 18,
        fontFamily: fonts.regular,
        color: textcolors.black,
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
        height: 100,
        width: 100,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
     buttonDisabled: {
        opacity: 0.6,
    },
});

export default SurveyCalories;