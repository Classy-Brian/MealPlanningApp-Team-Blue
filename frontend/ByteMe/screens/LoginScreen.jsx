import { Image, StyleSheet, Text, View, Button, TextInput} from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { fonts } from '../components/Fonts'
import { Link, useRouter } from "expo-router"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

function HeaderLogo() {
  return (
    <View style={styles.logocontainer}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const Login = ( {navigation} ) => {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');

  const handleLogin = async () => {
    const PORT = process.env.PORT;
    try {
      const res = await axios.post("http://localhost:" + PORT + "/auth/login", {email, password});
      await AsyncStorage.setItem("token", res.data.token);
      const router = useRouter();
      router.push("/(tabs)/home");
      alert("Successfully signed in!")
    }
    catch (err) {
      alert("Login failed. Please try again.");
    }
  }


  return (
    <View>
      <View>
        <Text style={styles.title}>Log In </Text>
        <HeaderLogo/>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.heading}>Email </Text>
        <View style={styles.inputContainer}>          
          <TextInput
            placeholder='Enter your email'
            onChangeText={setEmail}
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
            secureTextEntry
            onChangeText={setPass}
            placeholderTextColor={textcolors.lightgrey}
            style={styles.regularText}
            />
          
        </View>
        
      </View>
      <View style={styles.container}>
        <Text style={styles.forgot} >Forgot Password? </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title='Login'
          onPress={handleLogin}
          color={colors.primary}
          />
      </View>
      <View style={styles.container}>      
        <View style={styles.littlenote}>
          <Text style={styles.regularText}>Don't have an account yet? </Text>
          <Link href={"/(start)/signup"} asChild>
            <Text style={styles.createacc}>Register for free</Text>
          </Link>
        </View>       
      </View>
    </View>
  )
}

export default Login

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