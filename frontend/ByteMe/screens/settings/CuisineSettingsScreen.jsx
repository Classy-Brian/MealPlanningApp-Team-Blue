import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Checkbox } from 'react-native-paper';
import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';
import { fonts } from '../../components/Fonts';
import { styles } from '@/components/Sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

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

const CUISINE_OPTIONS = [
  'American', 'Asian', 'British', 'Caribbean', 'Central Europe', 'Chinese', 'Eastern Europe', 
  'French', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean', 'Kosher', 'Mediterranean', 
  'Mexican', 'Middle Eastern', 'Nordic', 'South American', 'South East Asian', 'World'
];

const CuisineSettingScreen = () => {
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [axiosInstance, setAxiosInstance] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          setAxiosInstance(() => axios.create({
            baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
            headers: { Authorization: `Bearer ${storedToken}` },
          }));
        } else {
          Alert.alert("Error", "Not logged in. Please log in first");
        }
      } catch (error) {
        console.error("Error getting token:", error);
        Alert.alert("Error", "Failed to load authentication token.");
      }
    };
    getToken();
  }, []);

  const fetchUserData = async () => {
    if (!axiosInstance) return;
    try {
      const response = await axiosInstance.get(`/api/users/profile/${token}`);
      const userCuisine = response.data.cuisines || [];
      setSelectedCuisines(userCuisine);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Could not load user data.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [axiosInstance]);

  const toggleSelection = (cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((item) => item !== cuisine) : [...prev, cuisine]
    );
  };

  const saveCuisines = async () => {
    if (!axiosInstance) return;

    try {
      await axiosInstance.patch(`/api/users/preferences`, { cuisines: selectedCuisines });
      Alert.alert("Success", "Cuisines updated successfully!");
      fetchUserData();
    } catch (error) {
      console.error("Error updating cuisines:", error);
      Alert.alert("Error", "Could not update cuisines. Please try again.");
    }
  };

  const renderCuisineGrid = () => {
    const rows = [];
    for (let i = 0; i < CUISINE_OPTIONS.length; i += 2) {
      const row = (
        <View key={i} style={styles_cuisine.row}>
          <View style={styles_cuisine.cuisineItem}>
            <Checkbox.Android
              status={selectedCuisines.includes(CUISINE_OPTIONS[i]) ? 'checked' : 'unchecked'}
              onPress={() => toggleSelection(CUISINE_OPTIONS[i])}
              color="#284B63"
            />
            <Text style={styles_cuisine.cuisineText}>{CUISINE_OPTIONS[i]}</Text>
          </View>
          {CUISINE_OPTIONS[i + 1] && (
            <View style={styles_cuisine.cuisineItem}>
              <Checkbox.Android
                status={selectedCuisines.includes(CUISINE_OPTIONS[i + 1]) ? 'checked' : 'unchecked'}
                onPress={() => toggleSelection(CUISINE_OPTIONS[i + 1])}
                color="#284B63"
              />
              <Text style={styles_cuisine.cuisineText}>{CUISINE_OPTIONS[i + 1]}</Text>
            </View>
          )}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles_cuisine.safeArea}>
      <ScrollView contentContainerStyle={styles_cuisine.scrollContainer}>
        <BackButton />

        <Text style={[styles.title, { marginTop: 10 }]}>Cuisines</Text>
        <Text style={styles_cuisine.normalText}>Select the cuisines you like most for your recommendations.</Text>

        {renderCuisineGrid()}

        <TouchableOpacity style={styles_cuisine.saveButton} onPress={saveCuisines}>
          <Text style={styles_cuisine.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles_cuisine = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cuisineItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cuisineText: {
    fontSize: 16,
    marginLeft: 8,
    flexShrink: 1,
  },
  normalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.header,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    alignSelf: 'center',
    minWidth: 150,
  },
  saveButtonText: {
    color: textcolors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CuisineSettingScreen;
