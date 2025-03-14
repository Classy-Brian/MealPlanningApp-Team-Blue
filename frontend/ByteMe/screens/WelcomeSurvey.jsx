import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { useRouter } from 'expo-router'
import { styles } from '@/components/Sheet'

function HeaderLogo() {
  return (
    <View style={styles.logocontainer}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const WelcomeSurvey = ( { navigation } ) => {
  // const router = useRouter();

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <View>
          <Text style={styles.title}>Welcome to </Text>
          <HeaderLogo/>
        </View>

        <View style={styles.container}>
          <Text style={styles.heading}>Would you like to take a quick survey?</Text>
          <Text style={styles.regularText}>It's so we can personally tailor your meal plan for you!</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('survey2')}>
          <View style={button.bluebutton}>
            <Text style={styles.buttonText}>Yes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={button.greybutton}>
            <Text style={styles.buttonText}>Skip Survey</Text>
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