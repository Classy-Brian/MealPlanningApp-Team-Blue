import { Image, Text, View, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Checkbox } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import backarrow from '@/assets/images/back_arrow_navigate.png'
import nextarrow from '@/assets/images/next_arrow_navigate.png'
import nextpage from '@/assets/images/next_arrow.png'

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { styles, styles_survey, styles_buttons } from '@/components/Sheet'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');
const nextArrowImage = require('../../assets/images/next_arrow_navigate.png');
const nextButtonImage = require('../../assets/images/next_arrow.png');

function NextButton() {
  return (
    <View >
      <Image source={nextButtonImage}/>
    </View>
  )
}

const SurveyAllergies = ({ navigation }) => {

  const [allergies, setSelectedAllergies] = useState([]);

  const options = ['Milk', 'Egg', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'];

  const toggleSelection = (option) => {
    setSelectedAllergies((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  useEffect(() => {
  const load = async () => {
    const savedAllergies = await AsyncStorage.getItem('allergies');
    if (savedAllergies) {
      setSelectedAllergies(JSON.parse(savedAllergies));
    }
  };
  load();
  }, []);

  const nextPage = async () => {
    await AsyncStorage.setItem('allergies', JSON.stringify(allergies));
    navigation.navigate('survey3');
  };

  const prevPage = async () => {
    await AsyncStorage.setItem('allergies', JSON.stringify(allergies));
    navigation.navigate('survey1');
  };

  const skipPage = async () => {
    try {
      await AsyncStorage.removeItem('allergies');
      navigation.navigate('survey3');
    } catch (e) {
      console.error("Failed to handle skip allergies", e);
      Alert.alert("Error", "Could not skip this step");
    }
  };

  return (
    <SafeAreaView style={styles.whiteBackground}>
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>

        {/* Header buttons */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={prevPage}>
            <View style={styles.greybutton}>
              <Image style={{marginRight:10}}
                      source={backArrowImage}/>
              <Text style={styles.regularText}>Survey</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={skipPage}>
            <View style={[styles.greybutton, {justifyContent: 'space-between'}]}>
              <Text style={[styles.regularText, {marginRight:10}]}>Skip</Text>
              <Image source={nextArrowImage}/>            
            </View>
          </TouchableOpacity>          
        </View>

        {/* Title */}
        <Text style={[styles.title, {marginTop: 10}]}>Allergies </Text>
        <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
          Select all allergies you have. These won't be included in your suggested recipes.
        </Text>

        <View style={styles.greybox}>
          <View style={[styles_buttons.whitebox, {marginHorizontal: 12, marginVertical: 12}]}>
            {options.map((option, index) => (
            <View key={index} style={[styles_buttons.checklist]}>
              <Checkbox 
                status={allergies.includes(option) ? 'checked' : 'unchecked'}
                onPress={() => toggleSelection(option)}
                color={colors.header}
                
              />
              <Text style={styles.regularText}>{option}</Text>
            </View>
            ))}
          </View>
        </View>
        
        
      </View>
      <TouchableOpacity onPress={nextPage}>
        <View style={[styles_buttons.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 130}]}]}>
          <NextButton />
        </View>
      </TouchableOpacity>
      
    </View>
    </SafeAreaView>
    
  );
};

export default SurveyAllergies