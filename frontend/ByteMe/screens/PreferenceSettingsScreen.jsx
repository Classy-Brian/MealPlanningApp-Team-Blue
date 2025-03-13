// frontend/byte-me/screens/PreferenceSettingsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert, SafeAreaView, CheckBox } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Defines an array of objects, each representing an allergy option
// Probably move this to backend? 
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

const PreferenceSettingsScreen = () => {
    const [selectedAllergies, setSelectedAllergies] = useState([]); // Array of IDs
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('67c3fb884ece0f7446647ec1_rdm_user_ID'); // <- Replace later
    const [error, setError] = useState(null);
    const params = useLocalSearchParams();
    const router = useRouter();
    const { from } = params;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // const response = await axios.get(`http://localhost:5000/api/users/${userId}`); //Uncomment
                // const allergyNames = response.data.allergies;

                // // Convert names to IDs
                // const allergyIds = allergyNames.map(name => {
                //  const found = ALLERGY_OPTIONS.find(option => option.label === name);
                //     return found ? found.id : null; // Return the ID, or null if not found
                // }).filter(id => id !== null); // Remove any null values

                // setSelectedAllergies(allergyIds);

                //FOR TESTING PURPOSES
                  const allergyNames = ["Peanuts", "Dairy"];

                  // Convert names to IDs
                    const allergyIds = allergyNames.map(name => {
                    const found = ALLERGY_OPTIONS.find(option => option.label === name);
                        return found ? found.id : null; // Return the ID, or null if not found
                    }).filter(id => id !== null); // Remove any null values

                    setSelectedAllergies(allergyIds);

                setError(null);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data.");
                Alert.alert("Error", "Could not load user data. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const renderAllergyItem = ({ item }) => (
        <View style={styles.allergyItem}>
            <CheckBox
                value={selectedAllergies.includes(item.id)}
                onValueChange={(newValue) => {
                    if (newValue) {
                        // Add to selected allergies
                        setSelectedAllergies([...selectedAllergies, item.id]);
                    } else {
                        // Remove from selected allergies
                        setSelectedAllergies(selectedAllergies.filter((id) => id !== item.id));
                    }
                }}
            />
            <Text style={styles.allergyText}>{item.label}</Text>
        </View>
    );

    const saveAllergies = async () => {
         try {
         // Convert IDs to allergy names before sending
          const allergiesToSend = selectedAllergies.map(id => {
            const found = ALLERGY_OPTIONS.find(option => option.id === id);
            return found ? found.label : null; // Convert back to name
            }).filter(name => name !== null);

          const updatedUser = await axios.put(`http://localhost:5000/api/users/${userId}`, {
             allergies: allergiesToSend, // Send the updated array
           });
           //You don't necessarily need to do anything with the response.
           // setAllergies(updatedUser.data.allergies); // You *could* update local state, but it's usually better to refetch.
            Alert.alert("Success", "Allergies updated successfully!");
            

           } catch (err) {
                console.error("Error updating allergies:", err);
                 setError(err.message || "Failed to update allergies."); // Set a user-friendly error message
                 Alert.alert("Error", "Could not update allergies. Please try again.");
             }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text>Loading user data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text>Error: {error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
             <View style={styles.container}>
                <Text style={styles.title}>{from}</Text>
                 <FlatList
                    data={ALLERGY_OPTIONS}
                    renderItem={renderAllergyItem}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                />
                <Button title="Save" onPress={saveAllergies} />
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    list: {
        marginBottom: 20,
    },
    allergyItem: {
        flexDirection: 'row',
        alignItems: 'center', // Align checkbox and text vertically
        marginBottom: 10, // Add some spacing between items
    },
    allergyText: {
        fontSize: 16,
        marginLeft: 10, // Add some space between the checkbox and the text
    },
});

export default PreferenceSettingsScreen;