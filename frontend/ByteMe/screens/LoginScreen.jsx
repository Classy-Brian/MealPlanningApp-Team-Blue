import { StyleSheet, Image, Text, View, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { Link, useRouter } from "expo-router"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { styles } from '@/components/Sheet'


function HeaderLogo() {
  return (
    <View style={logo.logocontainer}>
      <Image
        style={logo.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [isFocused, setFocused] = useState(styles.inputContainer)
  const [isFocused1, setFocused1] = useState(styles.inputContainer)

  const window = Dimensions.get('window')

  const handleLogin = async () => {
    // const PORT = process.env.PORT;
    try {
      if (!email || !password ) {
        alert("Please fill in all fields.");
      }
      // const res = await axios.post("http://10.0.2.2:" + "5005" + "/api/users/login", {email, password});
      const res = await axios.post(" http://192.168.1.65:5005/api/users/login", {email, password});
      await AsyncStorage.setItem('authToken', res.data.token);
      if (res.status === 200) {
        setEmail('');
        setPass('');

        setTimeout(() => {
          Alert.alert("Success", "You're signed in now!", [{text: "OK"}], {cancelable: true});
        }, 100);
        router.replace('/(tabs)/home');
      }
    }
    catch (err) {
      if (__DEV__) {
        console.error("Error", err);
      }
      if (err.response) {
        console.error("Response error:", err.response.data);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Message:", err.message);
      }
      if (err.response && err.response.status === 500) {
        Alert.alert("Error signing up. Please try again.", "", [{text: "OK"}], {cancelable: true});
      }
    }
  }


  return (
    <View style={styles.whiteBackground}>
      <View style={[styles.screenContainer, {marginTop: 20}]}>          
        <View >
          <Text style={[styles.title, {fontSize: 36}]}>Sign in</Text>
          <HeaderLogo/>
          <View>
            <View style={[logo.circle, {width: 70, height: 70, transform: [{translateY: 420}]}]}/>
            <View style={[logo.circle, {width: 450, height: 450, transform: [{translateX: -100}, {translateY: -30}]}]}/>
            <View style={[logo.circle, {width: 200, height: 200, transform: [{translateX: 180}, {translateY: 40}]}]}/>
            <View style={[logo.circle, {width: 100, height: 100, transform: [{translateX: 300}, {translateY: -250}]}]}/>
          </View>
        </View>

        <View style={styles.container}>        
          <Text style={styles.heading}>Email </Text>
          <View>          
            <TextInput
              placeholder='Enter your email'
              onChangeText={setEmail}
              placeholderTextColor={textcolors.lightgrey}
              style={isFocused} 
              onFocus={() => setFocused(styles.focusedinput)}
              onBlur={() => setFocused(styles.inputContainer)}
              />
          </View>
        </View>
        
        <View style={styles.container}>
          <Text style={styles.heading}>Password </Text>
          <View >          
            <TextInput
              placeholder='Enter your password'
              secureTextEntry
              onChangeText={setPass}
              placeholderTextColor={textcolors.lightgrey}
              style={isFocused1}
              onFocus={() => setFocused1(styles.focusedinput)}
              onBlur={() => setFocused1(styles.inputContainer)}
              />          
          </View>        
        </View>

        <View style={styles.container}>
          <Text style={styles.forgot} >Forgot Password? </Text>
        </View>
        
        <TouchableOpacity onPress={handleLogin}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Login</Text>
          </View>
        </TouchableOpacity>
 
        <View style={[styles.littlenote, {bottom: -241}]}>
          <Text style={styles.regularText}>Don't have an account yet? </Text>
          <Link href={"/(start)/signup"} asChild>
            <Text style={styles.createacc}>Register for free</Text>
          </Link>
        </View>   
      </View>

      <View style={[logo.bluebar, {width: window.width}]}/>
    </View> 
  )
}

export default Login;

const logo = StyleSheet.create({
  logocontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.header,
    marginRight: 5,
    paddingVertical: 55,
    borderRadius: 30,
    marginBottom: 50,
    right: 50,
    elevation: 5,
  },
  stretch: {
    width: 288,
    height: 120,
    resizeMode: 'stretch'
  },
  bluebar: {
    height: 70,
    backgroundColor: colors.header,
    position: 'absolute',
    bottom: 0,
  },
  circle: {
    borderRadius: 250,
    backgroundColor: colors.lightgrey,
    position: 'absolute',
  },
})