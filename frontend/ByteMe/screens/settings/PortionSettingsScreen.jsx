import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';
import { fonts } from '../../components/Fonts';
import { styles } from '@/components/Sheet';
import { RadioButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

const backarrow = require('@/assets/images/back_arrow_navigate.png');

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

const PortionSettingsScreen = () => {
  const [portion, setPortion] = useState(1);
  const [isCustom, setIsCustom] = useState(false);
  const [customPortion, setCustomPortion] = useState('');
  const [token, setToken] = useState(null);
  const [axiosInstance, setAxiosInstance] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          setAxiosInstance(() =>
            axios.create({
              baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
              headers: { Authorization: `Bearer ${storedToken}` },
            })
          );
        } else {
          Alert.alert("Error", "Not logged in. Please log in first.");
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
      const userPortion = parseInt(response.data.portion, 10);
      if (userPortion > 5) {
        setIsCustom(true);
        setCustomPortion(userPortion.toString());
      } else {
        setPortion(isNaN(userPortion) ? 1 : userPortion);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Could not load user portion data.");
    }
  };

  useEffect(() => {
    if (axiosInstance) fetchUserData();
  }, [axiosInstance]);

  const handleSelection = (value) => {
    if (value === 'custom') {
      setIsCustom(true);
      setPortion(null);
    } else {
      setIsCustom(false);
      setPortion(parseInt(value, 10));
    }
  };

  const savePortionSize = async () => {
    if (!axiosInstance) {
      Alert.alert("Error", "Session invalid. Please log in again.");
      return;
    }

    const finalPortion = isCustom ? parseInt(customPortion, 10) : portion;

    if (!finalPortion || finalPortion <= 0) {
      Alert.alert("Error", "Please enter a valid portion size.");
      return;
    }

    try {
      await axiosInstance.patch(`/api/users/preferences`, { portion: finalPortion });
      Alert.alert("Success", "Portion size updated successfully!");
    } catch (error) {
      console.error("Error updating portion size:", error);
      Alert.alert("Error", "Could not update portion size. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles_portion.safeArea}>
      <View style={styles_portion.container}>
        <BackButton />

        <Text style={[styles.title, { marginTop: 10 }]}>Portion Size</Text>
        <Text style={styles_portion.normalText}>Select how many people you're feeding.</Text>

        <View style={styles_portion.optionsContainer}>
          <RadioButton.Group onValueChange={handleSelection} value={isCustom ? 'custom' : portion?.toString()}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity key={num} onPress={() => handleSelection(num.toString())} style={styles_portion.optionRow}>
                <RadioButton.Android
                  value={num.toString()}
                  status={portion === num && !isCustom ? 'checked' : 'unchecked'}
                  color={colors.header}
                />
                <Text style={styles_portion.optionLabel}>{num} {num === 1 ? 'person' : 'people'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => handleSelection('custom')} style={styles_portion.optionRow}>
              <RadioButton.Android
                value="custom"
                status={isCustom ? 'checked' : 'unchecked'}
                color={colors.header}
              />
              <Text style={styles_portion.optionLabel}>5+ (custom)</Text>
            </TouchableOpacity>
          </RadioButton.Group>

          {isCustom && (
            <View style={styles_portion.customInputContainer}>
              <TextInput
                value={customPortion}
                onChangeText={setCustomPortion}
                placeholder="Enter number of people"
                keyboardType="numeric"
                style={styles_portion.customInput}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles_portion.saveButton} onPress={savePortionSize}>
          <Text style={styles_portion.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles_portion = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  normalText: { fontSize: 16, marginBottom: 20 },
  optionsContainer: { marginTop: 20 },
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
  customInputContainer: {
    marginTop: 10,
    backgroundColor: colors.lightgrey,
    borderRadius: 10,
    padding: 10,
  },
  customInput: {
    height: 50,
    fontSize: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 10,
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
