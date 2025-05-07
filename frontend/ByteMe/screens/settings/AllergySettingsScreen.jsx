// Import necessary modules from React and React Native.
import React, { useState, useEffect } from "react";
import { Image, View, Text, StyleSheet, FlatList, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';
import { fonts } from '../../components/Fonts';
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png";

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Preference Settings</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Define allergy options
const ALLERGY_OPTIONS = [
  { id: 'dairy-free', label: 'Dairy' },
  { id: 'egg-free', label: 'Egg' },
  { id: 'fish-free', label: 'Fish' },
  { id: 'gluten-free', label: 'Gluten' },
  { id: 'peanut-free', label: 'Peanut' },
  { id: 'sesame-free', label: 'Sesame' },
  { id: 'shellfish-free', label: 'Shellfish' },
  { id: 'soy-free', label: 'Soy' },
  { id: 'tree-nut-free', label: 'Tree Nut' },
  { id: 'wheat-free', label: 'Wheat' },
];

export default function AllergySettingsScreen() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error("Not logged in.");

      const axiosInstance = axios.create({
        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axiosInstance.get(`/api/users/profile/${token}`);

      const storedAllergies = response.data.allergies || [];
      setSelectedAllergies(storedAllergies); // Stored allergies are IDs (e.g., fish-free, not label)
      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(item => item !== allergyId)
        : [...prev, allergyId]
    );
  };

  const saveAllergies = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error("Not logged in.");

      const axiosInstance = axios.create({
        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Saving allergies:", selectedAllergies);

      await axiosInstance.patch(`/api/users/preferences`, {
        allergies: selectedAllergies,
      });

      Alert.alert("Success", "Allergies updated successfully!");
      fetchUserData();
    } catch (err) {
      console.error("Error saving allergies:", err);
      Alert.alert("Error", "Could not update allergies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderAllergyItem = ({ item }) => (
    <View style={styles_allergies.allergyItem}>
      <Checkbox.Android
        status={selectedAllergies.includes(item.id) ? 'checked' : 'unchecked'}
        onPress={() => toggleSelection(item.id)}
        color="#284B63"
      />
      <Text style={styles_allergies.allergyText}>{item.label}</Text>
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
    );
  }

  return (
    <SafeAreaView style={styles_allergies.safeArea}>
      <View style={styles_allergies.container}>
        <BackButton />
        <Text style={[styles.title, { marginTop: 10 }]}>Allergies</Text>
        <Text style={styles_allergies.normalText}>
          Select all allergies you have. These won't be included in your suggested recipes.
        </Text>

        <FlatList
          data={ALLERGY_OPTIONS}
          renderItem={renderAllergyItem}
          keyExtractor={(item) => item.id}
          style={styles_allergies.list}
        />

        <TouchableOpacity
          style={styles_allergies.saveButton}
          onPress={saveAllergies}
        >
          <Text style={styles_allergies.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles_allergies = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
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