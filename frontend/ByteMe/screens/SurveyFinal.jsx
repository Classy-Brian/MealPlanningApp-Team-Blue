import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link, useRouter } from "expo-router"
import { styles } from '@/components/Sheet'
import { Formik } from 'formik'
import { Checkbox } from 'react-native-paper'

const SurveyFinal = () => {
  const route = useRouter();
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  const options = ['Milk', 'Egg', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame'];

  const toggleSelection = (option) => {
    setSelectedAllergies((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  // PASS ALLERGIES FROM SURVEYALLERGIES TO THIS PAGE AND THEN UPDATE TEH USER

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Finish creating account </Text>
        <Text style={[styles.heading, {marginBottom: 20}]}>Finished signing up? You'll still be able 
                                                                to add or edit preferences in your settings</Text>
        
        <TouchableOpacity onPress={() => route.push('../(start)/login')}>
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