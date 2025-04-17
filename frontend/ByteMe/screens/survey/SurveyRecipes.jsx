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

const SurveyRecipes = ({ navigation }) => {
    const [recipeCount, setRecipeCount] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadRecipeCount = async () => {
            try {
                const savedRecipeCount = await AsyncStorage.getItem('surveyRecipeCount');
                if (savedRecipeCount !== null) {
                    setRecipeCount(savedRecipeCount);
                }
            } catch (e) {
                console.error("Failed to load recipe count from storage", e);
            }
        };
        loadRecipeCount();
    }, []);

    const validateInput = () => {
        const val = parseInt(recipeCount, 10);

        if (val < 0) {
            Alert.alert("Invalid input", "Recipe count cannot be negative.");
            return null;
        }

        return val;
    }

    const nextPage = async() => {
        const validatedRecipeCount = validateInput();
        if (!validatedRecipeCount) return;

        setIsSaving(true);

        try {
            await AsyncStorage.setItem('surveyRecipeCount', JSON.stringify(validatedRecipeCount));
            navigation.navigate('surveyfinal', { validatedRecipeCount });
        } catch (e) {
            console.error("Failed to save recipe count", e);
            Alert.alert("Error", "Could not save your recipe count");
        } finally {
            setIsSaving(false);
        }
    };

    const prevPage = async () => {
        const validatedRecipeCount = validateInput();
        if (validatedRecipeCount) {
            try {
                await AsyncStorage.setItem('surveyRecipeCount', JSON.stringify(validatedRecipeCount));
            } catch(e) {
                console.error("Failed to save recipe count", e);
                Alert.alert("Error", "Could not save your recipe count");
            }
        }
        navigation.navigate('survey6');
    };

    const skipPage = async () => {
        setIsSaving(true);
        try {
            await AsyncStorage.removeItem('surveyRecipeCount');
            navigation.navigate('surveyfinal');
        } catch (e) {
            console.error("Failed to handle skip recipe count", e);
            Alert.alert("Error", "Could not skip this step");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles_recipeCount.safeArea}>
            <ScrollView
                contentContainerStyle={styles_recipeCount.scrollContainer}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles_recipeCount.screenContainer}>

                    {/* Header buttons */}
                    <View style={styles_recipeCount.headerButtons}>
                        <TouchableOpacity onPress={prevPage} disabled={isSaving}>
                            <View style={styles_recipeCount.greybutton}>
                                <Ionicons name="arrow-back" size={20} color={textcolors.black} style={{ marginRight: 5 }} />
                                <Text style={styles_recipeCount.regularText}>Calorie Intake</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={skipPage} disabled={isSaving}>
                            <View style={styles_recipeCount.greybutton}>
                                <Text style={[styles_recipeCount.regularText, { marginRight: 5 }]}>Skip</Text>
                                <Ionicons name="arrow-forward" size={20} color={textcolors.black} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={[styles_recipeCount.title, { marginTop: 10 }]}>New Recipes Tried</Text>
                    <Text style={[styles_recipeCount.regularText, styles_recipeCount.subtitle]}>
                        Set your target new recipes tried range.
                    </Text>

                    {/* Input Field */}
                    <View style={styles_recipeCount.inputGroup}>
                        <View style={styles_recipeCount.inputContainer}>
                            <Text style={styles_recipeCount.label}>Number of new recipes</Text>
                            <TextInput
                                style={styles_recipeCount.input}
                                placeholder="e.g., 5"
                                placeholderTextColor={textcolors.lightgrey}
                                value={recipeCount}
                                onChangeText={setRecipeCount}
                                keyboardType="number-pad"
                                returnKeyType="next"
                                maxLength={5}
                            />
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Floating Next Button */}
            <TouchableOpacity onPress={nextPage} style={styles_recipeCount.nextButtonContainer} disabled={isSaving}>
                <View style={[styles_recipeCount.nextbutton, isSaving && styles_recipeCount.buttonDisabled]}>
                    {isSaving ? <ActivityIndicator color={colors.white}/> : <NextButton />}
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );

};

const styles_recipeCount = StyleSheet.create({
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
    regularText: {
        fontSize: 16,
        color: textcolors.black,
        fontFamily: fonts.regular,
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
})

export default SurveyRecipes;