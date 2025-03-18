import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { styles } from '@/components/Sheet'
import { Checkbox } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'

function NextButton() {
  return (
    <View >
      <Image source={require('../assets/images/next_arrow.png')}/>
    </View>
  )
}

const SurveyAllergies = ({ navigation }) => {

  const window = Dimensions.get('window')

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
    navigation.navigate('surveyfinal', {allergies});
  };

  const prevPage = async () => {
    await AsyncStorage.setItem('allergies', JSON.stringify(allergies));
    navigation.navigate('survey1', { allergies });
  }



  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={prevPage}>
            <View style={[button.greybutton, ]}>
              <Image style={{marginRight:10}}
                      source={require('../assets/images/back_arrow_navigate.png')}/>
              <Text style={styles.regularText}>Survey</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextPage}>
            <View style={[button.greybutton, {justifyContent: 'space-between'}]}>
              <Text style={[styles.regularText, {marginRight:10}]}>Skip</Text>
              <Image source={require('../assets/images/next_arrow_navigate.png')}/>            
            </View>
          </TouchableOpacity>          
        </View>

        <Text style={[styles.title, {marginTop: 10}]}>Allergies </Text>
        <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>Select all allergies you have. These won't be included in your suggested recipes.</Text>
        <View style={button.greybox}>
          <View style={[button.whitebox, {marginHorizontal: 12, marginVertical: 12}]}>
            {options.map((option, index) => (
            <View key={index} style={[button.checklist]}>
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
        <View style={[button.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 130}]}]}>
          <NextButton />
        </View>
      </TouchableOpacity>
      
    </View>
    
  );
};

export default SurveyAllergies

const button = StyleSheet.create({
  checklist: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greybox: {
    backgroundColor: colors.lightgrey,
    borderRadius: 10,
  },
  whitebox: {
    backgroundColor: colors.white,
    borderRadius: 10,
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
  nextbutton: {
    borderRadius: 100,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#91A9C8',
    height: 170,
    width: 170,
    position: 'absolute',
    elevation: 2,
    shadowColor: colors.black,
    
  }
})