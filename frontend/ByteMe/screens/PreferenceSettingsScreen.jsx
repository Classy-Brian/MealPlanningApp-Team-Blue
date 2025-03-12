import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert, SafeAreaView, CheckBox } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('67c3fb884ece0f7446647ec1_rdm_user_ID');  //  Replace with actual user ID
    const [error, setError] = useState(null);
    const params = useLocalSearchParams();
    const { from } = params;

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
            const allergyNames = response.data.allergies;

            // Convert names to IDs
            const allergyIds = allergyNames.map(name => {
                const found = ALLERGY_OPTIONS.find(option => option.label === name);
                return found ? found.id : null;
            }).filter(id => id !== null);

            setSelectedAllergies(allergyIds);
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
             // Handle different error scenarios (404, 500, etc.)
            if (err.response && err.response.status === 404) {
                setError("User not found.");
                Alert.alert("Error", "User not found.");
            } else {
                setError(err.message || "Failed to fetch user data.");
                Alert.alert("Error", "Could not load user data. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if(userId){
            fetchUserData();
        }
    }, [userId]); // Dependency array: refetch when userId changes

    const renderAllergyItem = ({ item }) => (
        <View style={styles.allergyItem}>
            <CheckBox
                value={selectedAllergies.includes(item.id)}
                onValueChange={(newValue) => {
                    if (newValue) {
                        setSelectedAllergies([...selectedAllergies, item.id]);
                    } else {
                        setSelectedAllergies(selectedAllergies.filter((id) => id !== item.id));
                    }
                }}
            />
            <Text style={styles.allergyText}>{item.label}</Text>
        </View>
    );

    const saveAllergies = async () => {
        try {
            // Convert IDs to allergy names
            const allergiesToSend = selectedAllergies.map(id => {
                const found = ALLERGY_OPTIONS.find(option => option.id === id);
                return found ? found.label : null;
            }).filter(name => name !== null);

            // Use PATCH to update the user's allergies
            await axios.patch(`http://localhost:5000/api/users/${userId}`, {
                allergies: allergiesToSend,
            });

            Alert.alert("Success", "Allergies updated successfully!");
            fetchUserData(); // Refetch the data after the update

        } catch (err) {
            console.error("Error updating allergies:", err);
            if (err.response && err.response.status === 404) {
                setError("User not found.");
                 Alert.alert("Error", "User not found."); //Specific Error message
            } else {
                setError(err.message || "Failed to update allergies.");
                Alert.alert("Error", "Could not update allergies.  Please try again.");
            }

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
        alignItems: 'center',
        marginBottom: 10,
    },
    allergyText: {
        fontSize: 16,
        marginLeft: 10,
    },
});

export default PreferenceSettingsScreen;