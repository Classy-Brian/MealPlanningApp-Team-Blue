import { Image, StyleSheet, Text, View, Button, TextInput, Link } from 'react-native'
import React from 'react'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'

function HeaderLogo() {
  return (
    <View style={styles.titlecontainer}>
      <Image
        style={styles.stretch}
        source={require('../../assets/images/logo.png')}/>
    </View>
  )
}

const SignUp = () => {
  return (
    <View>
      <View>
        <Text style={styles.title}>Sign Up </Text>
        <HeaderLogo/>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.heading}>Email </Text>
        <View style={styles.inputContainer}>          
          <TextInput
            placeholder='Enter your email'
            placeholderTextColor={textcolors.lightgrey}
            style={styles.regularText} 
            />
        </View>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.heading}>Password </Text>
        <View style={styles.inputContainer}>          
          <TextInput
            placeholder='Enter your password'
            placeholderTextColor={textcolors.lightgrey}
            style={styles.regularText}
            />
        </View>
      </View>      
      <View style={styles.buttonContainer}>
        <Button
          title='Create Account'
          color={colors.primary}
          />
      </View>
    </View>
  )
}

export default SignUp

const styles = StyleSheet.create({
    titlecontainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'left',
        backgroundColor: colors.header,
        marginHorizontal: 65,
        paddingVertical: 55,
        paddingHorizontal: 20,
        borderRadius: 30,

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
        fontSize: 24
    },
    regularText: {
        fontSize: 15
    },
    forgot: {
      fontSize: 15,
      color: textcolors.red,
      fontWeight: 'bold',
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
    }
})