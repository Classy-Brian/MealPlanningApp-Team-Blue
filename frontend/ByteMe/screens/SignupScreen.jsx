import { Image, Text, View, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { Link, useRouter } from "expo-router"
import axios from "axios"
import { styles } from '@/components/Sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'

function HeaderLogo() {
  return (
    <View style={[logo.logocontainer, {alignSelf: 'stretch'}]}>
      <Image
        style={logo.stretch}
        source={require('../assets/images/logo.png')}/>
    </View>
  )
}

const SignUp = () => {
  const route = useRouter();
  const [name, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [confpassword, setConfPass] = useState('');
  const [isFocused, setFocused] = useState(styles.inputContainer);
  const [isFocused2, setFocused2] = useState(styles.inputContainer);
  const [isFocused3, setFocused3] = useState(styles.inputContainer);
  const [isFocused4, setFocused4] = useState(styles.inputContainer);

  const window = Dimensions.get('window')

  const handleChange = async () => {
    // const PORT = 5005;
    
    try {
      if (!name || !email || !password || !confpassword ) {
        Alert.alert("Please fill in all fields.", "", [{text: "OK"}], {cancelable: true});
        return;
      }

      if (password != confpassword) {
        Alert.alert("Password doesn't match", "", [{text: "OK"}], {cancelable: true});
        return;
      }

      console.log('Sending registration data...', {name, email, password})
      // const res = await axios.post("http://10.0.2.2:" + "5005" + "/api/users", {name, email, password});
      const res = await axios.post("http://192.168.1.65:5005/api/users", {name, email, password});

      const token = res.data.token;
      if (!token) {
        throw new Error('Token not received');
      }
      await AsyncStorage.setItem('authToken', token);
      
      if (res.status === 201) {
        setUserName('');
        setEmail('');
        setPass('');
        setConfPass('');

        setTimeout(() => {
          Alert.alert("Success", "Registration successful!", 
                      [{text: "OK", onPress: () => route.replace("/(survey)/survey_1")}]);
        }, 100);
      }
      
    }
    catch (err) {
      if (__DEV__) {
        console.error("Error", err);
      }
      
      if (err.response && err.response.status === 400) {
        Alert.alert("This email is already registered!", "Please try signing up again with a different email.", 
            [{text: "OK"}], {cancelable: true});
        return;
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
          <Text style={[styles.title, {fontSize: 36}]}>Create an account</Text>
          <HeaderLogo/>
          <View>
            <View style={[logo.circle, {width: 70, height: 70, transform: [{translateY: 420}]}]}/>
            <View style={[logo.circle, {width: 450, height: 450, transform: [{translateX: -100}, {translateY: -30}]}]}/>
            <View style={[logo.circle, {width: 200, height: 200, transform: [{translateX: 180}, {translateY: 40}]}]}/>
            <View style={[logo.circle, {width: 100, height: 100, transform: [{translateX: 300}, {translateY: -250}]}]}/>
          </View>
        </View>
        
        <View style={styles.container}>
            <Text style={styles.heading}>Username </Text>
            <View >          
              <TextInput
                placeholder='Enter a username'
                placeholderTextColor={textcolors.lightgrey}
                onChangeText={setUserName}
                value={name}
                style={isFocused}
                onFocus={() => setFocused(styles.focusedinput)}
                onBlur={() => setFocused(styles.inputContainer)}
              />
            </View>
          
        </View>

        <View style={styles.container}>
          <Text style={styles.heading}>Email </Text>
          <View>          
            <TextInput
              placeholder='Enter your email'
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setEmail}
              value={email}
              style={isFocused2} 
              onFocus={() => setFocused2(styles.focusedinput)}
              onBlur={() => setFocused2(styles.inputContainer)}
              />
          </View>
        </View>
        
        <View style={styles.container}>
          <Text style={styles.heading}>Password </Text>
          <View>          
            <TextInput
              placeholder='Enter your password'
              secureTextEntry
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setPass}
              value={password}
              style={isFocused3}
              onFocus={() => setFocused3(styles.focusedinput)}
              onBlur={() => setFocused3(styles.inputContainer)}
              />
          </View>
        </View> 

        <View style={styles.container}>
          <Text style={styles.heading}>Confirm Password </Text>
          <View>          
            <TextInput
              placeholder='Confirm your password'
              secureTextEntry
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setConfPass}
              value={confpassword}
              style={isFocused4}
              onFocus={() => setFocused4(styles.focusedinput)}
              onBlur={() => setFocused4(styles.inputContainer)}
              />
          </View>
        </View> 

        <TouchableOpacity onPress={handleChange}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.littlenote, {bottom: -90}]}>
          <Text style={styles.regularText}>Have an account already? </Text>
          <Link href={"/(start)/login"} asChild>
            <Text style={styles.createacc}>Log in</Text>
          </Link>            
        </View>
      </View>
      
      <View style={[logo.bluebar, {width: window.width}]}/>
      
    </View>
  )
}


export default SignUp;

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