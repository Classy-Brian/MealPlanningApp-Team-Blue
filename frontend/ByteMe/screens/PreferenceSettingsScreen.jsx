// Import necessary modules from React and React Native.
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';  // For making HTTP requests.
import { useLocalSearchParams, useRouter, Link } from 'expo-router'; // Import useRouter
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Checkbox } from 'react-native-paper';

import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons

// Defines an array of allergy options.  Each option is an object with an 'id' and a 'label'.
// (e.g., constants/allergies.js)
const ALLERGY_OPTIONS = [
    { id: 'milk', label: 'Milk' },
    { id: 'egg', label: 'Egg' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'treeNuts', label: 'Tree Nuts' },
    { id: 'peanuts', label: 'Peanuts' },
    { id: 'wheat', label: 'Wheat' },
    { id: 'soybeans', label: 'Soybeans' },
    { id: 'sesame', label: 'Sesame' },
];

// Main functional component for the Preference Settings screen.
const PreferenceSettingsScreen = () => {
    // State variables using the useState hook:
    const [selectedAllergies, setSelectedAllergies] = useState([]); // Stores the *IDs* of selected allergies.
    const [loading, setLoading] = useState(true); // Indicates whether data is being loaded.
    const [error, setError] = useState(null); // Stores any error messages.

    // --- expo-router hooks ---
    const params = useLocalSearchParams(); // Get parameters passed to this route
    const router = useRouter(); // Access to the router object (not used here, but good to have)
    const { from } = params; // Extract a specific parameter (title of page)

    const fetchUserData = async () => {
        try {
            setLoading(true); // Show loading indicator.
            console.log("Fetching user data")

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                // Handle the case where there's no token
                setError("Not logged in.")
                Alert.alert("Error", "Not logged in. Please log in first.");
                setLoading(false);
                return;
            }

            const axiosInstance = axios.create({
                baseURL: 'http://192.168.4.66:5005',
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });

            const response = await axiosInstance.get(`/api/users/profile/${token}`);

            // Extract allergy names from the response.
            const allergyNames = response.data.allergies;

            // Convert the allergy *names* (from the backend) to allergy *IDs* (for internal use).
            const allergyIds = allergyNames.map(name => {
                const found = ALLERGY_OPTIONS.find(option => option.label === name);
                return found ? found.id : null; // Return null if not found (shouldn't happen with valid data).
            }).filter(id => id !== null); // Remove any null values (handles cases where the name doesn't match).

            setSelectedAllergies(allergyIds); // Update the state with the selected allergy IDs.
            setError(null);  // Clear any previous errors.

        } catch (err) {
            console.error("Error fetching user data:", err);
            // More specific error handling, checking for 404.
            if (err.response && err.response.status === 404) {
                setError("User not found.");
                Alert.alert("Error", "User not found.");
            } else {
                setError(err.message || "Failed to fetch user data.");
                Alert.alert("Error", "Could not load user data. Please check your connection and try again.");
            }
        } finally {
            setLoading(false); // Hide loading indicator (always executed).
        }
    };

    useEffect(() => {
        fetchUserData(); // Fetch data when the component mounts
    }, []); 

    // Function to render a single allergy item in the FlatList.
    const renderAllergyItem = ({ item }) => (
        <View style={styles.allergyItem}>
            <Checkbox.Android
                status={selectedAllergies.includes(item.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleSelection(item.id)}
                color="#284B63"
            />
            <Text style={styles.allergyText}>{item.label}</Text>
        </View>
    );
    
    const toggleSelection = (allergyLabel) => {
        setSelectedAllergies(prevSelected =>
            prevSelected.includes(allergyLabel)
                ? prevSelected.filter(item => item !== allergyLabel)
                : [...prevSelected, allergyLabel]
        );
    };

    // Function to save the selected allergies to the backend.
    const saveAllergies = async () => {
        try {
            setLoading(true); // Show loading indicator
            setError(null);    // Clear any previous errors

            // Convert the selected allergy *IDs* back to *names* for sending to the backend.
            const allergiesToSend = selectedAllergies.map(id => {
                const found = ALLERGY_OPTIONS.find(option => option.id === id);
                return found ? found.label : null;
            }).filter(name => name !== null);

            console.log("allergiesToSend:", allergiesToSend); // Debugging log

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                // Handle the case where there's no token
                setError("Not logged in.")
                Alert.alert("Error", "Not logged in. Please log in first.");
                setLoading(false);
                return;
            }

            const axiosInstance = axios.create({
                baseURL: 'http://192.168.4.66:5005',
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });

            await axiosInstance.put(`/api/users/preferences`, { allergies: allergiesToSend });

            Alert.alert("Success", "Allergies updated successfully!"); // Provide user feedback
            fetchUserData();

        } catch (err) {
            console.error("Error updating allergies:", err);
            if (err.response && err.response.status === 404) {
                setError("User not found.");
                Alert.alert("Error", "User not found.");
            } else {
                setError(err.message || "Failed to update allergies.");
                Alert.alert("Error", "Could not update allergies. Please try again.");
            }
        } finally {
            setLoading(false);  // Hide loading indicator
        }
    };

    // Conditional rendering: Show loading indicator while fetching data.
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text>Loading user data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Conditional rendering: Show error message if there was an error.
    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text>Error: {error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Main UI rendering:
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                <View style={styles.header}>
                    <Link href="/settings" asChild>
                        <TouchableOpacity style={styles.settingsButton}>
                                <Ionicons name="arrow-back" size={24} color="black" />
                                <Text style={styles.settingsText}>Settings</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <Text style={styles.title}>{from}</Text>
                <Text style={styles.normalText}>Select all allergies you have. These won't be included in your suggested recipes.</Text>

            <FlatList
                data={ALLERGY_OPTIONS}
                renderItem={renderAllergyItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
            />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveAllergies}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
    
};

// Styles for the components.
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    normalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    list: {
        marginBottom: 20,
    },
    allergyItem: {
        flexDirection: 'row',
        alignItems: 'center', 
        marginBottom: 10, 
    },
    allergyText: {
        fontSize: 16,
        marginLeft: 10, 
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', 
        left: 0,
        top: 0,
    },
    settingsText: {
        fontSize: 20,
        marginLeft: 5,
    },
});

export default PreferenceSettingsScreen;