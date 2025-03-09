import { Image, Text, View, Button, TextInput } from 'react-native'
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

  const handleChange = async () => {
    const PORT = process.env.PORT;
    try {
      if (!firstName || !lastName || !email || !password ) {
        alert("Please fill in all fields.");
      }
      const res = await axios.post("http://10.0.2.2:" + "8081" + "/register", {firstName, lastName, email, password});
      alert("User registered!");
      const router = useRouter();
      router.push("/LoginScreen");
    }
    catch (err) {
      alert("Error signing up. Please try again.");
    }
  }

  return (
    <View style={styles.screenContainer}>
      <View >
        <Text style={styles.title}>Sign Up </Text>
        <HeaderLogo/>
      </View>
      
      <View style={styles.namecontainer}>
        <View style={styles.secondcontainer}>
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
        <View style={styles.secondcontainer}>
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


export default SignUp;