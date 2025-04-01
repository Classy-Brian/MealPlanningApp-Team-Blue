import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions, Alert, SafeAreaView } from 'react-native'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'
import { RadioButton } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');
const feeds1Icon = require('../../assets/images/feeds1_icon.png')
const feeds2Icon = require('../../assets/images/feeds2_icon.png')
const feeds4Icon = require('../../assets/images/feeds4_icon.png')

const PORTION_OPTIONS = [
    { value: 1, label: 'Feeds 1', description: 'Individual', icon: feeds1Icon },
    { value: 2, label: 'Feeds 2', description: 'Couple', icon: feeds2Icon },
    { value: 4, label: 'Feeds 4', description: 'Family', icon: feeds4Icon },
]

const PortionSettingsScreen = () => {
    const [portion, setSelectedPortion] = useState(null);
    const params = useLocalSearchParams();
    const { from } = params;
    const router = useRouter();
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
        if (!axiosInstance) return;

        try {
            console.log("Fetching user data for portion size");
            const response = await axiosInstance.get(`/api/users/profile/${token}`)
            const userPortion = response.data.portion;
            const portionValue = parseInt(userPortion, 10);
            setSelectedPortion(isNaN(portionValue) ? 1: portionValue)
        } catch (error) {
            console.error("Error, fetching user data:", error);
            if (err.response && err.response.status === 404) {
                Alert.alert("Error", "User profile not found.");
            } else if (err.response && err.response.status === 401) {
                Alert.alert("Error", "Unauthorized. Please log in again.");
            } else {
                Alert.alert("Error", "Could not load portion data.");
            }
        }
    };

    useEffect(() => {
        if (axiosInstance){
            fetchUserData();
        }
    }, [axiosInstance]);

    const handleSelection = (value) => {
        setSelectedPortion(value);
    };

    const savePortionSize = async () => {
        if (portion === null) {
            Alert.alert("Selection Needed", "Please select a portion size to save.");
            return;
        }
        if (!axiosInstance) {
            Alert.alert("Error", "Session invalid. Please log in again.");
            return;
        }

        try { 
            console.log("Saving portion size:", portion)

            await axiosInstance.patch(`/api/users/preferences`, {
                portion: portion
            });

            Alert.alert("Success", "Portion size updated successfully!");

        } catch (error) {
            console.error("Error updating portion size:", error);
            Alert.alert("Error", "Could not update portion size. Please try again.");
        }
    }

    return (
        <SafeAreaView style={styles_portion.safeArea}>
            <View style={styles_portion.container}>

                {/* Header */}
                <View style={styles_portion.header}>
                    <TouchableOpacity
                        style={styles_portion.settingsButton}
                        onPress={() => router.back()} 
                    >
                        <Image style={{marginRight:10}}
                            source={backArrowImage}/>
                        <Text style={styles_portion.settingsText}>Preference</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, {marginTop: 10}]}>{from}</Text>
                <Text style={styles_portion.normalText}>Select your preferred portion size.</Text>

                {/* Radio Button Options */}
                <View style={styles_portion.optionsContainer}>
                    <RadioButton.Group onValueChange={newValue => handleSelection(parseInt(newValue, 10))} value={portion?.toString()}>
                        {PORTION_OPTIONS.map((option) => (
                            <TouchableOpacity key={option.value} onPress={() => handleSelection(option.value)} style={styles_portion.optionRow}>
                                <RadioButton.Android
                                    value={option.value.toString()}
                                    status={portion === option.value ? 'checked' : 'unchecked'}
                                    color={colors.header}
                                />
                                <Text style={styles_portion.optionLabel}>{option.label}</Text>
                                <Image source={option.icon} style={styles_portion.optionIcon} />
                            </TouchableOpacity>
                        ))}
                    </RadioButton.Group>
                </View>

                <TouchableOpacity
                    style={styles_portion.saveButton}
                    onPress={savePortionSize}
                >
                    <Text style={styles_portion.saveButtonText}>Save</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

const styles_portion = StyleSheet.create({
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

export default PortionSettingsScreen;