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

const SignUp = ( {navigation} ) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [isFocused, setFocused] = useState(styles.inputContainer);
  const [isFocused2, setFocused2] = useState(styles.inputContainer);
  const [isFocused3, setFocused3] = useState(styles.inputContainer);

  const handleChange = async () => {
    const PORT = process.env.PORT;
    try {
      if (!firstName || !lastName || !email || !password ) {
        alert("Please fill in all fields.");
      }
      const res = await axios.post("http://10.0.2.2:" + "8081" + "/api/users", {userName, email, password});
      if (res.status === 201) {
        Alert.alert("Success", "Registration successful!", [
          {text: "OK", onPress: () => navigation.navigate("survey1")}
        ]);
      }
      alert("User registered!");
      // const router = useRouter();
      // router.push("/(survey)/survey_1");
      navigation.navigate("survey1")
    }
    catch (err) {
      Alert.alert("Error signing up. Please try again.");
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
                value={userName}
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