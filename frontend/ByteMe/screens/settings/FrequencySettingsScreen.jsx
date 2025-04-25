import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions, Alert, SafeAreaView } from 'react-native'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'
import { RadioButton } from 'react-native-paper'
import { useLocalSearchParams } from 'expo-router'

import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from "@react-navigation/native";

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Preference Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const FREQUENCY_OPTIONS = [
    { value: "1.5", label: '1-2 days / week', description: 'Light Cook' },
    { value: "3.5", label: '3-4 days / week', description: 'Moderate Cook' },
    { value: "6",   label: '5-7 days / week', description: 'Heavy Cook' },
];

const FrequencySettingsScreen = () => {
    const [frequency, setSelectedFrequency] = useState(null);
    const params = useLocalSearchParams();
    const { from } = params;
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);

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
        if (!axiosInstance || !token) return;

        try {
            console.log("Fetching user data for frequency");
            const response = await axiosInstance.get(`/api/users/profile/${token}`)
            const userFrequency = response.data.frequency;
            const frequencyValue = FREQUENCY_OPTIONS.some(opt => opt.value === userFrequency)
                                    ? userFrequency
                                    : FREQUENCY_OPTIONS[0].value;
            setSelectedFrequency(frequencyValue)
        } catch (error) {
            console.error("Error, fetching user data:", error);
            if (err.response && err.response.status === 404) {
                Alert.alert("Error", "User profile not found.");
            } else if (err.response && err.response.status === 401) {
                Alert.alert("Error", "Unauthorized. Please log in again.");
            } else {
                Alert.alert("Error", "Could not load frequency data.");
            }
        }
    };

    useEffect(() => {
        if (axiosInstance){
            fetchUserData();
        }
    }, [axiosInstance]);

    const handleSelection = (value) => {
        setSelectedFrequency(value);
    };
    
    const saveFrequency = async() => {
        if (frequency === null) {
            Alert.alert("Selection Needed", "Please select a frequency to save.");
            return;
        }
        if (!axiosInstance) {
            Alert.alert("Error", "Session invalid. Please log in again.");
            return;
        }

        try { 
            console.log("Saving frequency:", frequency)

            await axiosInstance.patch(`/api/users/preferences`, {
                frequency: frequency
            });

            Alert.alert("Success", "frequency updated successfully!");

        } catch (error) {
            console.error("Error updating frequency:", error);
            Alert.alert("Error", "Could not update frequency. Please try again.");
        }
    }

    return (
        <SafeAreaView style={styles_frequency.safeArea}>
            <View style={styles_frequency.container}>
    
                {/* Header */}
                <BackButton />

                <Text style={[styles.title, {marginTop: 10}]}>Cooking Frequency</Text>
                <Text style={styles_frequency.normalText}>How many days per week do you typically plan to cook or prepare meals?</Text>
    
                {/* Radio Button Options */}
                <View style={styles_frequency.optionsContainer}>
                    <RadioButton.Group onValueChange={newValue => handleSelection(newValue)} value={frequency}>
                        {FREQUENCY_OPTIONS.map((option) => (
                            <TouchableOpacity key={option.value} onPress={() => handleSelection(option.value)} style={styles_frequency.optionRow}>
                                <RadioButton.Android 
                                    value={option.value} 
                                    status={frequency === option.value ? 'checked' : 'unchecked'}
                                    color={colors.header}
                                />
                                <Text style={styles_frequency.optionLabel}>{option.description}</Text>
                                <Text style={styles_frequency.optionLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </RadioButton.Group>
                </View>
    
                    <TouchableOpacity
                        style={styles_frequency.saveButton}
                        onPress={saveFrequency}
                    >
                        <Text style={styles_frequency.saveButtonText}>Save</Text>
                    </TouchableOpacity>
    
            </View>
        </SafeAreaView>
    );

};

const styles_frequency = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 20,
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
    optionsContainer: {
        marginTop: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightgrey,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    optionLabel: {
        fontSize: 18,
        marginLeft: 10,
        flex: 1,
        color: textcolors.black,
        fontFamily: fonts.regular,
    },
    optionIcon: {
        width: 40,
        height: 40,
        marginLeft: 10,
        resizeMode: 'contain',
    },
    saveButton: {
        backgroundColor: colors.header, 
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20, 
        alignSelf: 'center', 
        minWidth: 150, 
    },
    saveButtonText: {
        color: textcolors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default FrequencySettingsScreen;