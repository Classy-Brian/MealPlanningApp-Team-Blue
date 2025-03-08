import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';

const SettingsScreen = () => {
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('67c3fb884ece0f7446647ec1_rdm_user_ID'); // <- Needs to be replace with actual ID, TESTING, DELETE LATER
    const [error, setError] = useState(null);

    // Fetch user's allergies on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true); //start the loading
                setAllergies(["Peanuts", "Dairy"]); // <- FOR TESTING, DELETE LATER
                // const response = await axios.get(`http://localhost:5000/api/users/${userId}`); // Fetch from backend, NEED TO DO LATER
                // setAllergies(response.data.allergies);
                setError(null);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data."); 
                Alert.alert("Error", "Could not load user data. Please check your connection and try again.");
            } finally {
                setLoading(false); // Set loading to false in all cases
            }
        };

        fetchUserData();
    }, [userId]); // Dependency array ensures this runs when userId changes

    // Add a new allergy
    const addAllergy = async () => {
        if (newAllergy.trim() === '') {
            Alert.alert('Error', 'Please enter an allergy.');
            return;
        }

        try {
            const updatedUser = await axios.put(`http://localhost:5000/api/users/${userId}`, {
                allergies: [...allergies, newAllergy], // Send updated allergies array
            });
            setAllergies(updatedUser.data.allergies); //update state with what returns from server
            setNewAllergy(''); // Clears the input field
            setError(null);
        } catch (err) {
            console.error("Error adding allergy:", err);
            setError(err.message || "Failed to add allergy.");
            Alert.alert("Error", "Could not add allergy. Please try again.");
        }
    };

    // Remove an allergy
    const removeAllergy = async (allergyToRemove) => {
        try {
            const updatedUser = await axios.put(`http://localhost:5000/api/users/${userId}`, {
                allergies: allergies.filter((allergy) => allergy !== allergyToRemove), //Filter out from array
            });
            setAllergies(updatedUser.data.allergies); //Update states with what returns from server
            setError(null);
        } catch (err) {
            console.error("Error removing allergy:", err);
            setError(err.message || "Failed to remove allergy.");
            Alert.alert("Error", "Could not remove allergy. Please try again.");
        }
    };

    // Render item in the list
    const renderAllergyItem = ({ item }) => (
        <View style={styles.allergyItem}>
            <Text style={styles.allergyText}>{item}</Text>
            <Button title="Remove" onPress={() => removeAllergy(item)} color="red" />
        </View>
    );

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
         )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Edit Allergies</Text>

                <FlatList
                    data={allergies}
                    renderItem={renderAllergyItem}
                    keyExtractor={(item, index) => index.toString()}  // Use index as key
                    style={styles.list}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add new allergy"
                        value={newAllergy}
                        onChangeText={setNewAllergy}
                    />
                    <Button title="Add" onPress={addAllergy} />
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    allergyText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginRight: 10,
        borderRadius: 5,
    },
});

export default SettingsScreen;
