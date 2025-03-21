import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { useRouter } from 'expo-router'
import { styles } from '@/components/Sheet'

function HeaderLogo() {
  return (
    <View style={[button.logocontainer]}>
      <Image
        style={button.stretch}
        source={require('../../assets/images/logo.png')}/>
    </View>
  )
}

const WelcomeSurvey = ( { navigation, route } ) => {
  const router = useRouter();

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

  return (
    <View style={styles.whiteBackground}>
      <View style={[styles.screenContainer, ]}>
        <View>
          <View style={button.greybox}>
            <Text style={[styles.title]}>Welcome to </Text>
          </View>
          <HeaderLogo/>
        </View>

        <View style={[{marginTop: 180, marginBottom: 120}]}>
          <Text style={[button.othergreybox, button.heading]}>Would you like to take a quick survey?</Text>
          <Text style={[button.othertext, button.subheading]}>It's so we can personally tailor your meal plan for you!</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('survey2')}>
          <View style={button.bluebutton}>
            <Text style={[styles.buttonText, {fontSize: 30, color: colors.white}]}>Yes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('surveyfinal', { allergies: allergies })}>
          <View style={button.greybutton}>
            <Text style={[styles.buttonText, {fontSize: 30,}]}>Skip Survey</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    )
}

export default WelcomeSurvey;

const button = StyleSheet.create({
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
      borderRadius: 20,
      marginHorizontal: 60,
      paddingVertical: 10,
      backgroundColor: colors.grey,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      elevation: 2,
      shadowColor: colors.black,
    },
    greybox: {
      flexDirection: 'row',
      alignItems: 'left',
      justifyContent: 'center',
      backgroundColor: colors.othergrey,
      borderRadius: 30,
      paddingVertical: 10,
      marginRight: 70,
      marginTop: 30,
      left: 20,
    },
    logocontainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.header,
      paddingHorizontal: 5,
      borderRadius: 30,
      position: 'absolute',
      marginLeft: 60,
      marginTop: 105,
      left: 20,
    },
    stretch: {
      width: 240,
      height: 100,
      resizeMode: 'stretch'
    },
    othergreybox: {
      backgroundColor: colors.othergrey, 
      fontSize: 30, 
      textAlign: 'center',
      borderRadius: 40,
      paddingHorizontal: 5,
      paddingTop: 10,
      paddingBottom: 60,
      marginRight: 40,
    },
    othertext: {
      backgroundColor: '#91A9C8', 
      textAlign: 'center',
      fontSize: 22,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      position: 'absolute',
      marginLeft: 50,
      transform: [{translateY: 120}],
    },
    heading: {
      fontSize: 36,
      fontFamily: fonts.semiBold
    },
    subheading: {
      fontsize: 30,
      fontFamily: fonts.medium,
    },
})