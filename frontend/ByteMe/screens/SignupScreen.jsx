import { Image, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { Link, useRouter } from "expo-router"
import axios from "axios"
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

const SignUp = () => {
  const route = useRouter();
  const [name, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [isFocused, setFocused] = useState(styles.inputContainer);
  const [isFocused2, setFocused2] = useState(styles.inputContainer);
  const [isFocused3, setFocused3] = useState(styles.inputContainer);

  const handleChange = async () => {
    // const PORT = 5000;
    
    try {
      if (!name || !email || !password ) {
        Alert.alert("Please fill in all fields.", "", [{text: "OK"}], {cancelable: true});
        return;
      }
      console.log('Sending registration data...', {name, email, password})
      const res = await axios.post("http://10.0.2.2:" + "5000" + "/api/users", {name, email, password});
      
      if (res.status === 201) {
        setUserName('');
        setEmail('');
        setPass('');

        setTimeout(() => {
          Alert.alert("Success", "Registration successful!", 
                      [{text: "OK", onPress: () => route.push("/(survey)/survey_1")}]);
        }, 100);
      }
      
    }
    catch (err) {
      console.log('buttons:', buttons);
      console.error("Error", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
      } else if (err.request) {
        console.error("Request:", err.request);
      } else {
        console.error("Message:", err.message);
      }
      Alert.alert("Error signing up. Please try again.", "", [{text: "OK"}], {cancelable: true});
    }
  }

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <View >
          <Text style={styles.title}>Sign Up </Text>
          <HeaderLogo/>
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

        <TouchableOpacity onPress={handleChange}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Create Account</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.container}>
          <View style={styles.littlenote}>
            <Text style={styles.regularText}>Have an account already? </Text>
            <Link href={"/(start)/login"} asChild>
              <Text style={styles.createacc}>Log in</Text>
            </Link>            
          </View>
        </View>
      </View>
      
    </View>
    
  )

}


export default SignUp;