import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link } from "expo-router"
import { styles } from '@/components/Sheet'
import { Formik } from 'formik'
import { Checkbox } from 'react-native-paper'

const SurveyAllergies = ({ navigation }) => {
  const [allergies, setSelectedAllergies] = useState([]);

  const options = ['Milk', 'Egg', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'];

  const toggleSelection = (option) => {
    setSelectedAllergies((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const nextPage = () => {
    navigation.navigate('surveyfinal', {allergies});
  };

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Allergies </Text>
        <Text style={[styles.regularText, {marginBottom: 20}]}>Select all allergies you have. These won't be included in your suggested recipes.</Text>
        {options.map((option, index) => (
          <View key={index} style={button.checklist}>
            <Checkbox 
              status={allergies.includes(option) ? 'checked' : 'unchecked'}
              onPress={() => toggleSelection(option)}
              color={colors.header}
              
            />
            <Text style={styles.regularText}>{option}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={nextPage}>
          <View style={[button.bluebutton, {marginTop: 30}]}>
            <Text style={styles.buttonText}>Next</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    
  );
};

export default SurveyAllergies

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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: colors.black,
  },
  greybutton: {
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 60,
    paddingVertical: 10,
    backgroundColor: colors.othergrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: colors.black,
  },
})