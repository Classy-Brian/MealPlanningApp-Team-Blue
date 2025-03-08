import { Image, StyleSheet, Text, View, Button, TextInput } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link, useRouter } from "expo-router"
import axios from "axios"

function HeaderLogo() {
  return (
    <View style={styles.logocontainer}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');

  const handleChange = async () => {
    const PORT = process.env.PORT;
    try {
      const res = await axios.post("http://localhost:" + PORT + "/auth/register", {firstName, lastname, email, password});
      alert("User registered!");
      const router = useRouter();
      router.push("/LoginScreen");
    }
    catch (err) {
      alert("Error signing up. Please try again.");
    }
  }

  return (
    <View>
      <View>
        <Text style={styles.title}>Sign Up </Text>
        <HeaderLogo/>
      </View>
      
      <View style={styles.namecontainer}>
        <View style={styles.container}>
          <Text style={styles.heading}>First Name </Text>
          <View style={styles.inputContainer}>          
            <TextInput
              placeholder='Enter your first name'
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setFirstName}
              // value={user.firstname}
              style={styles.regularText} 
              />
          </View>
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>Last Name </Text>
          <View style={styles.inputContainer}>          
            <TextInput
              placeholder='Enter your last name'
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setLastName}
              // value={user.lastname}
              style={styles.regularText} 
              />
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.heading}>Email </Text>
        <View style={styles.inputContainer}>          
          <TextInput
            placeholder='Enter your email'
            placeholderTextColor={textcolors.lightgrey}
            onChangeText={setEmail}
            // value={user.email}
            style={styles.regularText} 
            />
        </View>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.heading}>Password </Text>
        <View style={styles.inputContainer}>          
          <TextInput
            placeholder='Enter your password'
            secureTextEntry
            placeholderTextColor={textcolors.lightgrey}
            onChangeText={setPass}
            // value={user.password}
            style={styles.regularText}
            />
        </View>
      </View>      
      <View style={styles.buttonContainer}>
        <Button
          title='Create Account'
          color={colors.primary}
          onPress={handleChange}
          />
      </View>
      <View style={styles.container}>
        <View style={styles.littlenote}>
          <Text style={styles.regularText}>Have an account already? </Text>
          <Link href={"/(start)/login"} asChild>
            <Text style={styles.createacc}>Log in</Text>
          </Link>            
        </View>
      </View>
    </View>
  )

}


export default SignUp

const styles = StyleSheet.create({
    logocontainer: {
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