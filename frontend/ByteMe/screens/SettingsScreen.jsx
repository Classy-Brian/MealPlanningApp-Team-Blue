import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Button, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';

const SettingsScreen = () => {
    const [allergies, setAllergies] = useState([]);
    const [newAllergy, setNewAllergy] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('67c3fb884ece0f7446647ec1'); // <- Needs to be replace with actual ID, TESTING
    const [error, setError] = useState(null);

    // Fetch user's allergies on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true); //start the loading
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`); // Fetch from backend, NEED TO DO LATER
                setAllergies(response.data.allergies);
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

    // Remove an allergy

    // Render item in the list
};
