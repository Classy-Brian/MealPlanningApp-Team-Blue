import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link, useRouter } from "expo-router"
import { styles } from '@/components/Sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

const SurveyFinal = ( { navigation, route } ) => {
  const router = useRouter();
  // const { allergies } = route.params;
  const [allergies, setAllergies] = useState([]);

  useEffect(() => {
    const load = async () => {
      const savedAllergies = await AsyncStorage.getItem('allergies');
      if (savedAllergies) {
        setAllergies(JSON.parse(savedAllergies));
      }
    };

    if (route.params?.allergies) {
      setAllergies(route.params.allergies);
    } else {
      load();
    }
  }, []);

  const handleSubmitSurvey = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');    // Retrieves the token
      if (!token) {
        console.error("AUTHENTICATION TOKEN IS MISSING");
        return;
      }

      // const res = await axios.put("http://10.0.2.2:" + "5000" + "/api/users/preferences", { allergies },
      //                             { headers: { Authorization: `Bearer ${token}`}});
      const res = await axios.put("http://localhost:5000/api/users/preferences", { allergies },
                                  { headers: { Authorization: `Bearer ${token}`}});
      console.log('Survey saved:', res.data);

      if (res.status === 200) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('allergies')
        router.replace('../(start)/login');
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
    navigation.navigate('survey2', { allergies });
  }

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={prevPage}>
            <View style={[button.greybutton, ]}>
              <Image style={{marginRight:10}}
                      source={require('../assets/images/back_arrow_navigate.png')}/>
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