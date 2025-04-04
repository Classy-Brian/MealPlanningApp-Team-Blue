import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { Link, useRouter } from "expo-router"
import { styles } from '@/components/Sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const SurveyFinal = ( { navigation, route } ) => {
  const router = useRouter();
  const [allergies, setAllergies] = useState([]);
  const [portion, setSelectedPortion] = useState(null);
  const [cuisines, setSelectedCuisines] = useState([]);
  const [dislikedIngredients, setDislikedIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Had to clean old data
  // useEffect(() => {
  //   const clearOldData = async () => {
  //       try {
  //           await AsyncStorage.removeItem('cuisines');
  //           await AsyncStorage.removeItem('surveyCuisines');
  //           console.log('Cleared stale survey data from AsyncStorage');
  //       } catch (e) {
  //           console.error('Failed to clear AsyncStorage', e);
  //       }
  //   };
  //   clearOldData();
  // }, []);

  const handleSubmitSurvey = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error("AUTHENTICATION TOKEN IS MISSING");
        Alert.alert("Error", "Authentication missing. Please log in again.");
        setIsLoading(false);
        return;
      }

      const savedAllergies = await AsyncStorage.getItem('allergies');
      const savedPortionSize = await AsyncStorage.getItem('portion');
      const savedCuisines = await AsyncStorage.getItem('cuisines');
      const SavedDislikedIngredients = await AsyncStorage.getItem('dislikes');

      const allergies = savedAllergies ? JSON.parse(savedAllergies) : [];
      const portion = savedPortionSize ? JSON.parse(savedPortionSize) : "1";
      const cuisines = savedCuisines ? JSON.parse(savedCuisines) : [];
      const dislikes = SavedDislikedIngredients ? JSON.parse(SavedDislikedIngredients) : [];

      console.log(allergies, portion, cuisines, dislikes)

      const res = await axios.patch(process.env.EXPO_PUBLIC_BACKEND_URL + "/api/users/preferences", { allergies, portion, cuisines, dislikes },
        { headers: { Authorization: `Bearer ${token}`}});
      console.log('Survey saved:', res.data);

      if (res.status === 200) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('allergies')
        await AsyncStorage.removeItem('portion')
        await AsyncStorage.removeItem('cuisines')
        await AsyncStorage.removeItem('dislikes')
        router.replace('../../(start)/login');
      }
    } catch (err) {
      if (__DEV__) {
        console.error("Error", err);
      }
        
        if (err.response) {
          console.error("Response error:", err.response.data);
        } else if (err.request) {
          console.error("Request:", err.request);
        } else {
          console.error("Message:", err.message);
        }
        if (err.response && err.response.status === 500) {
          Alert.alert("Something went wrong.", "", [{text: "OK"}], {cancelable: true});
        }      
      }
  }

  const prevPage = () => {
    navigation.navigate('survey5', { allergies, portion, cuisines });
  }

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={prevPage}>
            <View style={[button.greybutton, ]}>
              <Image style={{marginRight:10}}
                      source={require('../../assets/images/back_arrow_navigate.png')}/>
              <Text style={styles.regularText}>Back</Text>
            </View>
          </TouchableOpacity>      
        </View>

        <Text style={[styles.title, {marginBottom: 80}]}>Finish Sign Up </Text>
        <Text style={[styles.heading, button.greybox, {fontSize: 30, textAlign: 'center'}]}>Finished signing up? You'll still be able 
                      to add or edit preferences in your settings.</Text>
        
        <TouchableOpacity onPress={handleSubmitSurvey}>
          <View style={[button.bluebutton, {marginTop: 30}]}>
            <Text style={[styles.buttonText, {fontSize: 20, color: textcolors.white}]}>Finish</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    
  );
};

export default SurveyFinal

const button = StyleSheet.create({
  checklist: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bluebutton: {
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 100,
    paddingVertical: 10,
    backgroundColor: colors.header,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: colors.black,
  },
  greybutton: {
    flexDirection: 'row',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.othergrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: colors.black,
  },
  greybox: {
    backgroundColor: colors.othergrey,
    borderRadius: 30,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    paddingVertical: 20, 
    marginBottom: 120
  }
})