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
                            <Text style={styles.regularText}>Calorie Intake</Text>
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
                    <Text style={[styles.title, { marginTop: 10 }]}>New Recipes Tried</Text>
                    <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
                        Set your target new recipes tried range.
                    </Text>

                    {/* Input Field */}
                    <View style={styles_survey.inputGroup}>
                        <View style={styles_survey.inputContainer}>
                            <Text style={styles_survey.label}>Number of new recipes</Text>
                            <TextInput
                                style={styles_survey.input}
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

export default SurveyRecipes;