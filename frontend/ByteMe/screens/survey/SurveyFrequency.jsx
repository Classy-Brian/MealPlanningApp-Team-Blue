import {
    Text, View, Alert, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Image, Keyboard
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RadioButton } from 'react-native-paper'
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

const FREQUENCY_OPTIONS = [
    { value: "1.5", label: '1-2 days / week', description: 'Light Cook' },
    { value: "3.5", label: '3-4 days / week', description: 'Moderate Cook' },
    { value: "6",   label: '5-7 days / week', description: 'Heavy Cook' },
];

const SurveyFrequency = ({ navigation }) => {
    const [selectedFrequency, setSelectedFrequency] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadFrequency  = async () => {
            try {
                const savedFrequency  = await AsyncStorage.getItem('surveyFrequency'); 
                if (savedFrequency  !== null) {
                    const parsedValue = JSON.parse(savedFrequency);
                    if (!isNaN(parsedValue) && FREQUENCY_OPTIONS.some(opt => opt.value === parsedValue)) {
                        setSelectedFrequency(parsedValue);
                    } else {
                        console.warn("Invalid frequency value found:", savedFrequency);
                    }
                }
            } catch (err) {
            console.error("Failed to load frequency from storage", err);
            }
        };
        loadFrequency ();
    }, []);

    const handleSelection = (value) => {
        setSelectedFrequency(value);
    };

    const nextPage = async() => {
        setIsSaving(true);

        try {
            await AsyncStorage.setItem('surveyFrequency', JSON.stringify(selectedFrequency));
            navigation.navigate('surveyfinal');
        } catch (e) {
            console.error("Failed to save frequency", e);
            Alert.alert("Error", "Could not save your frequency");
        } finally {
            setIsSaving(false);
        }
    };

    const prevPage = async () => {
        if (selectedFrequency) {
            try {
                await AsyncStorage.setItem('surveyFrequency', JSON.stringify(selectedFrequency));
            } catch(e) {
                console.error("Failed to save frequency", e);
                Alert.alert("Error", "Could not save your frequency");
            }
        }
        navigation.navigate('survey7');
    };

    const skipPage = async () => {
        setIsSaving(true);
        try {
            await AsyncStorage.removeItem('surveyFrequency');
            navigation.navigate('surveyfinal');
        } catch (e) {
            console.error("Failed to handle skip frequency", e);
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
                            <Text style={styles.regularText}>Recipe Count</Text>
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
                    <Text style={[styles.title, {marginTop: 10}]}>Cooking Frequency </Text>
                    <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
                        How many days per week do you typically plan to cook or prepare meals?
                    </Text>

                    {/* Radio Button Options */}
                    <View style={styles_survey.optionsContainer}>
                        <RadioButton.Group onValueChange={newValue => handleSelection(parseInt(newValue, 10))} value={selectedFrequency?.toString()}>
                            {FREQUENCY_OPTIONS.map((option) => (
                                <TouchableOpacity key={option.value} onPress={() => handleSelection(option.value)} style={styles_survey.optionRow}>
                                    <RadioButton.Android 
                                        value={option.value.toString()} 
                                        status={selectedFrequency === option.value ? 'checked' : 'unchecked'}
                                        color={colors.header}
                                    />
                                    <Text style={styles_survey.optionLabel}>{option.label}</Text>
                                    <Text style={styles_survey.optionLabel}>{option.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </RadioButton.Group>
                    </View>

                </ScrollView>

                {/* Floating Next Button */}
                <TouchableOpacity onPress={nextPage}>
                    <View style={[styles_buttons.nextbutton, {right: 0, top: 0, transform:[{translateX: 40}, {translateY: 220}]}]}>
                        <NextButton />
                    </View>
                </TouchableOpacity>

            </View>
        </View>
    );

};

export default SurveyFrequency;
