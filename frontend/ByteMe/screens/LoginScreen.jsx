import { Image, Text, View, Button, TextInput} from 'react-native'
import React, { useState } from 'react'
import { colors } from '../components/Colors'
import { textcolors} from '../components/TextColors'
import { Link, useRouter } from "expo-router"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
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

const Login = ( {navigation} ) => {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');

  const handleLogin = async () => {
    const PORT = process.env.PORT;
    try {
      const res = await axios.post("http://10.0.2.2:" + "8081" + "/login", {email, password});
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
    <View style={styles.screenContainer}>          
        <View >
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

export default Login;