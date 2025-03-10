import { Image, Text, View, TextInput, TouchableOpacity } from 'react-native'
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [isFocused, setFocused] = useState(styles.inputContainer)
  const [isFocused1, setFocused1] = useState(styles.inputContainer)    
  const [isFocused2, setFocused2] = useState(styles.inputContainer)
  const [isFocused3, setFocused3] = useState(styles.inputContainer)

  const handleChange = async () => {
    const PORT = process.env.PORT;
    try {
      if (!firstName || !lastName || !email || !password ) {
        alert("Please fill in all fields.");
      }
      const res = await axios.post("http://10.0.2.2:" + "8081" + "/register", {firstName, lastName, email, password});
      alert("User registered!");
      const router = useRouter();
      router.push("/(survey)/survey_1");
    }
    catch (err) {
      alert("Error signing up. Please try again.");
    }
  }

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <View >
          <Text style={styles.title}>Sign Up </Text>
          <HeaderLogo/>
        </View>
        
        <View style={styles.namecontainer}>
          <View style={styles.secondcontainer}>
            <Text style={styles.heading}>First Name </Text>
            <View >          
              <TextInput
                placeholder='Enter your first name'
                placeholderTextColor={textcolors.lightgrey}
                onChangeText={setFirstName}
                style={isFocused}
                onFocus={() => setFocused(styles.focusedinput)}
                onBlur={() => setFocused(styles.inputContainer)}
              />
            </View>
          </View>
          <View style={styles.secondcontainer}>
            <Text style={styles.heading}>Last Name </Text>
            <View>          
              <TextInput
                placeholder='Enter your last name'
                placeholderTextColor={textcolors.lightgrey}
                onChangeText={setLastName}
                style={isFocused1}
                onFocus={() => setFocused1(styles.focusedinput)}
                onBlur={() => setFocused1(styles.inputContainer)}
                />
            </View>
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.heading}>Email </Text>
          <View>          
            <TextInput
              placeholder='Enter your email'
              placeholderTextColor={textcolors.lightgrey}
              onChangeText={setEmail}
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