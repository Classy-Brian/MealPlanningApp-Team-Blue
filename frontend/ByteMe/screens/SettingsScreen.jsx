import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';

const SettingsScreen = () => {
    // const [allergies, setAllergies] = useState([]);
    const [allergies, setAllergies] = useState(["Peanuts", "Dairy"]); // <- TESTING
    const [newAllergy, setNewAllergy] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('67c3fb884ece0f7446647ec1_rdm_user_ID'); // <- Needs to be replace with actual ID, TESTING
    const [error, setError] = useState(null);

    // // Fetch user's allergies on component mount
    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         try {
    //             setLoading(true); //start the loading
    //             const response = await axios.get(`http://localhost:5000/api/users/${userId}`); // Fetch from backend, NEED TO DO LATER
    //             setAllergies(response.data.allergies);
    //             setError(null);
    //         } catch (err) {
    //             console.error("Error fetching user data:", err);
    //             setError(err.message || "Failed to fetch user data."); 
    //             Alert.alert("Error", "Could not load user data. Please check your connection and try again.");
    //         } finally {
    //             setLoading(false); // Set loading to false in all cases
    //         }
    //     };

    //     fetchUserData();
    // }, [userId]); // Dependency array ensures this runs when userId changes
    // Uncomment later once User backend API thing is made

    // // Add a new allergy
    // const addAllergy = async () => {
    //     if (newAllergy.trim() === '') {
    //         Alert.alert('Error', 'Please enter an allergy.');
    //         return;
    //     }

    //     try {
    //         const updatedUser = await axios.put(`http://localhost:5000/api/users/${userId}`, {
    //             allergies: [...allergies, newAllergy], // Send updated allergies array
    //         });
    //         setAllergies(updatedUser.data.allergies); //update state with what returns from server
    //         setNewAllergy(''); // Clears the input field
    //         setError(null);
    //     } catch (err) {
    //         console.error("Error adding allergy:", err);
    //         setError(err.message || "Failed to add allergy.");
    //         Alert.alert("Error", "Could not add allergy. Please try again.");
    //     }
    // };
    // Uncomment later once User backend API thing is made

    // Delete later after testing
    const addAllergy = () => { // No 'async' keyword
        if (newAllergy.trim() === '') {
            Alert.alert('Error', 'Please enter an allergy.');
            return;
        }

        // Directly update the state.  NO API CALL.
        setAllergies([...allergies, newAllergy.trim()]); 
        setNewAllergy('');
        setError(null); // Clear any previous errors
    };

    // // Remove an allergy
    // const removeAllergy = async (allergyToRemove) => {
    //     try {
    //         const updatedUser = await axios.put(`http://localhost:5000/api/users/${userId}`, {
    //             allergies: allergies.filter((allergy) => allergy !== allergyToRemove), //Filter out from array
    //         });
    //         setAllergies(updatedUser.data.allergies); //Update states with what returns from server
    //         setError(null);
    //     } catch (err) {
    //         console.error("Error removing allergy:", err);
    //         setError(err.message || "Failed to remove allergy.");
    //         Alert.alert("Error", "Could not remove allergy. Please try again.");
    //     }
    // };
    // Uncomment later once user API is made

    const removeAllergy = (allergyToRemove) => { // No 'async' keyword
        // Directly update the state.  NO API CALL.
        setAllergies(allergies.filter((allergy) => allergy !== allergyToRemove));
        setError(null); // Clear any previous errors
    };

    // Render item in the list
    const renderAllergyItem = ({ item }) => (
        <View style={styles.allergyItem}>
            <Text style={styles.allergyText}>{item}</Text>
            <Button title="Remove" onPress={() => removeAllergy(item)} color="red" />
        </View>
    );

    // if (loading) {
    //     return (
    //         <SafeAreaView style={styles.safeArea}>
    //             <View style={styles.container}>
    //                 <Text>Loading user data...</Text>
    //             </View>
    //         </SafeAreaView>

    //     );
    // }
    // Uncomment after User API

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
