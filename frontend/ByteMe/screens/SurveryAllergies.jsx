import { Image, StyleSheet, Text, View, Button, TextInput, ScrollView } from 'react-native'
import React from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link } from "expo-router"

const SurveyAllergies = () => {
  return (
    <View style={styles.screenContainer}>
      <View>
        <Text style={styles.title}>Allergies </Text>
      </View>

      <View>
        <Text style={styles.heading}>Would you like to take a quick survey?</Text>
        <Text style={styles.regularText}>It's so we can personally tailor your meal plan for you!</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title='Yes'
          color={colors.primary}
          />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title='Skip Survey'
          color={colors.othergrey}
          />
      </View>

    </View>
  )
}

export default SurveyAllergies

const styles = StyleSheet.create({
    screenContainer: {
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: 10,
    },
    logocontainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.header,
        marginHorizontal: 65,
        paddingVertical: 55,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    namecontainer: {
        flexDirection: 'row',
      },
    stretch: {
        width: 240,
        height: 100,
        resizeMode: 'stretch'
    },
    title: {
        fontSize: 48,
        fontFamily: fonts.bold,
    },
    heading: {
        fontSize: 24,
        fontFamily: fonts.semiBold,
    },
    regularText: {
        fontSize: 15,
        fontFamily: fonts.regular
    },
    forgot: {
      fontSize: 15,
      color: textcolors.red,
      fontWeight: 'bold',
    },
    createacc: {
      color: textcolors.blue,
      fontSize: 15,
    },
    buttonContainer: {
      marginHorizontal: 30,
      paddingHorizontal: 20,
      borderRadius: 10,
      paddingVertical: 25,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 1,
      paddingHorizontal: 10,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: textcolors.lightgrey,
      backgroundColor: colors.white,
    },
    container: {
      justifyContent: 'center',
      marginHorizontal: 20,
      paddingVertical: 10,
    },
    littlenote: {
      flexDirection: 'row'
    },
})