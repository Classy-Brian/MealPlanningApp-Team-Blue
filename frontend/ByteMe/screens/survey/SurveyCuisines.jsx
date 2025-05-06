import { Image, Text, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Checkbox } from 'react-native-paper'

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { styles, styles_survey, styles_buttons } from '@/components/Sheet'

const chineseFood = require('../../assets/images/chinese_food_icon.png'); 
const seafoodFood = require('../../assets/images/seafood_food_icon.png'); 
const japaneseFood = require('../../assets/images/japanese_food_icon.png'); 
const americanFood = require('../../assets/images/american_food_icon.png'); 
const italianFood = require('../../assets/images/italian_food_icon.png'); 
const mexicanFood = require('../../assets/images/mexican_food_icon.png'); 
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

const SurveyCuisines = ({ navigation }) => {
  const [cuisines, setSelectedCuisines] = useState([]);

  // const options = [
  //     { label: 'Chinese',  icon: chineseFood },
  //     { label: 'Seafood',  icon: seafoodFood },
  //     { label: 'Japanese', icon: japaneseFood },
  //     { label: 'American', icon: americanFood },
  //     { label: 'Italian',  icon: italianFood },
  //     { label: 'Mexican',  icon: mexicanFood },
  // ];

  const options = ['Chinese', 'Seafood', 'Japanese', 'American', 'Italian', 'Mexican'];

  const toggleSelection = (option) => {
    setSelectedCuisines((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  useEffect(() => {
    const load = async () => {
      const savedCuisines = await AsyncStorage.getItem('cuisines');
      if (savedCuisines) {
        setSelectedCuisines(JSON.parse(savedCuisines));
      }
    };
    load();
  }, []);

  const nextPage = async () => {
    await AsyncStorage.setItem('cuisines', JSON.stringify(cuisines));
    navigation.navigate('survey5');
  };

  const prevPage = async () => {
    await AsyncStorage.setItem('cuisines', JSON.stringify(cuisines));
    navigation.navigate('survey3');
  };

  const skipPage = async () => {
    try {
      await AsyncStorage.removeItem('cuisines');
      navigation.navigate('survey5');
    } catch (e) {
      console.error("Failed to handle skip cuisines", e);
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
                <Image style={{marginRight:10}} source={backArrowImage}/>
                <Text style={styles.regularText}>Portion</Text>
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
        <Text style={[styles.title, {marginTop: 10}]}>Cuisines</Text>
        <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
            Select the cuisines you like most for your recommendations.
        </Text>

        <View style={styles.greybox}>
            <View style={[styles_buttons.whitebox, {marginHorizontal: 12, marginVertical: 12}]}>
                {options.map((option, index) => (
                    <View key={index} style={[styles_buttons.checklist]}>
                        <Checkbox 
                            status={cuisines.includes(option) ? 'checked' : 'unchecked'}
                            onPress={() => toggleSelection(option)}
                            color={colors.header}
                        />
                        <Text style={styles.regularText}>{option}</Text>
                        {/* <Image source={options.icon} style={styles_cuisine.optionIcon} /> */}
                    </View>
                ))}
            </View>
        </View>
      </View>

        <TouchableOpacity onPress={nextPage}>
          <View style={[styles_buttons.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 265}]}]}>
              <NextButton />
          </View>
        </TouchableOpacity>
        
    </View>
    </SafeAreaView>
  
  );
};

export default SurveyCuisines