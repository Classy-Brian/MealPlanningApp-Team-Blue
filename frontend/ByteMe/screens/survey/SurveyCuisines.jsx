import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'
import { Checkbox } from 'react-native-paper'
import { useRouter } from 'expo-router'

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
        navigation.navigate('surveyfinal', { cuisines });
    };

    const prevPage = async () => {
        await AsyncStorage.setItem('cuisines', JSON.stringify(cuisines));
        navigation.navigate('survey3', { cuisines });
    }

    return (
    <View style={styles.whiteBackground}>
        <View style={styles.screenContainer}>

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity onPress={prevPage}>
                <View style={button.greybutton}>
                    <Image style={{marginRight:10}} source={backArrowImage}/>
                    <Text style={styles.regularText}>Portion</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={nextPage}>
                <View style={[button.greybutton, {justifyContent: 'space-between'}]}>
                    <Text style={[styles.regularText, {marginRight:10}]}>Skip</Text>
                    <Image source={nextArrowImage}/>            
                </View>
            </TouchableOpacity>          
        </View>

        <Text style={[styles.title, {marginTop: 10}]}>Cuisines</Text>
        <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
            Select the cuisines you like most for your recommendations.
        </Text>

        <View style={button.greybox}>
            <View style={[button.whitebox, {marginHorizontal: 12, marginVertical: 12}]}>
                {options.map((option, index) => (
                    <View key={index} style={[button.checklist]}>
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
        <View style={[button.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 265}]}]}>
            <NextButton />
        </View>
        </TouchableOpacity>
        
    </View>
    
    );
};

const styles_cuisine = StyleSheet.create({
    optionIcon: {
        width: 30,
        height: 30,
        marginLeft: 10,
        resizeMode: 'contain',
    },
})

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

export default SurveyCuisines