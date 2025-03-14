import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link, useRouter } from "expo-router"
import { styles } from '@/components/Sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const SurveyFinal = ( { route } ) => {
  const router = useRouter();
  const { allergies } = route.params;

  const handleSubmitSurvey = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');    // Retrieves the token
      if (!token) {
        console.error("TOKEN IS MISSING");
        return;
      }

      const res = await axios.put("http://10.0.2.2:" + "5000" + "/api/users/preferences", { allergies },
                                  { headers: { Authorization: `Bearer ${token}`}});
      console.log('Survey saved:', res.data);

      if (res.status === 200) {
        router.push('../(start)/login');
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

  // PASS ALLERGIES FROM SURVEYALLERGIES TO THIS PAGE AND THEN UPDATE TEH USER

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Finish creating account </Text>
        <Text style={[styles.heading, {marginBottom: 20}]}>Finished signing up? You'll still be able 
                                                                to add or edit preferences in your settings</Text>
        
        <TouchableOpacity onPress={handleSubmitSurvey}>
          <View style={[button.bluebutton, {marginTop: 30}]}>
            <Text style={[styles.buttonText, {color: textcolors.white}]}>Finish</Text>
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
    marginHorizontal: 60,
    paddingVertical: 10,
    backgroundColor: colors.header,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: colors.black,
  },
})