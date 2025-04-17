import {
    Text, View, Alert, ScrollView, TouchableOpacity,
    TextInput, Image
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
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
            navigation.navigate('survey7', { validatedCalories });
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
            navigation.navigate('survey7');
        } catch (e) {
            console.error("Failed to handle skip calories", e);
            Alert.alert("Error", "Could not skip this step");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.whiteBackground}>
            <View style={styles.screenContainer}>
                
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps='handled'
                >

                    {/* Header buttons */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={prevPage}>
                            <View style={styles.greybutton}>
                            <Image style={{marginRight:10}} source={backArrowImage}/>
                            <Text style={styles.regularText}>Disliked Ingredients</Text>
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
                    <Text style={[styles.title, { marginTop: 10 }]}>Calorie Goal</Text>
                    <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
                        Set your target daily calorie intake range.
                    </Text>

                    {/* Input Fields */}
                    <View style={styles_survey.inputGroup}>
                        <View style={styles_survey.inputContainer}>
                            <Text style={styles_survey.label}>Minimum Daily Calories</Text>
                            <TextInput
                                style={styles_survey.input}
                                placeholder="e.g., 1500"
                                placeholderTextColor={textcolors.lightgrey}
                                value={minCalories}
                                onChangeText={setMinCalories}
                                keyboardType="number-pad"
                                returnKeyType="next"
                                maxLength={5}
                            />
                        </View>

                        <View style={styles_survey.inputContainer}>
                            <Text style={styles_survey.label}>Maximum Daily Calories</Text>
                            <TextInput
                                style={styles_survey.input}
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
                    
                </ScrollView>
            </View>

            {/* Floating Next Button */}
            <TouchableOpacity onPress={nextPage}>
                <View style={[styles_buttons.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 265}]}]}>
                    <NextButton />
                </View>
            </TouchableOpacity>
        </View>
    );

};

export default SurveyCalories;