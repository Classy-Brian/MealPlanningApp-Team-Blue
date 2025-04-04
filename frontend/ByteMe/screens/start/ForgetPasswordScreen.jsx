import React, { useState } from 'react';
import {
  Button,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator 
} from 'react-native';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = () => {
    // if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
    //   Alert.alert("Invalid Email", "Please enter a valid email address.");
    //   return;
    // }

    if(!email){
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    console.log("Mock: Pretending to send reset instructions to:", email);

    setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('verifycode', { email: email });

    }, 1500);

    const submitResetRequest = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors
      try {
        // const response = await axiosInstance.post('/api/users/forgot-password', { email }); // <- Make API call later once completed email verif
        // console.log("Forgot password response:", response.data);
        // Alert.alert("Check Your Email", `Password reset instructions sent to ${email}.`);

        // MOCK Success for now:
        console.log("Mock: Pretending to send reset instructions to:", email);
        Alert.alert("Check Your Email", `Password reset instructions sent to ${email} (mock).`);
        navigation.navigate('verifycode', { email: email });

      } catch (error) {
        console.error("Forgot Password Error:", error);
        const message = error.response?.data?.message || "Could not request password reset. Please try again.";
        Alert.alert("Error", message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    submitResetRequest();
  }

  return (
    <SafeAreaView style={styles_forgot.safeArea}>
      <View style={styles_forgot.container}>

        {/* Back Button */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={() => navigation.goBack()} >
            <View style={styles_forgot.greybutton}>
              <Image style={{marginRight:10}} source={backArrowImage}/>
              <Text style={styles_forgot.backButtonText}>Login</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles_forgot.title}>Reset Password</Text>
        <Text style={styles_forgot.subtitle}>
            Please enter your email to reset the password.
        </Text>

        <View style={styles_forgot.inputContainer}>
            <TextInput
                style={styles_forgot.input}
                placeholder="username@mail.com"
                placeholderTextColor={textcolors.lightgrey}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
            />
        </View>

        <TouchableOpacity
            style={[styles_forgot.button, isLoading && styles_forgot.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={textcolors.white} />
            ) : (
                <Text style={styles_forgot.buttonText}>Reset Password</Text>
            )}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen

const styles_forgot = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute', 
    left: 0,
    top: 0,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.othergrey,
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: colors.black,
  },
  backButtonText: {
    fontSize: 20,
    marginLeft: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    color: textcolors.black,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: textcolors.darkgrey,
    marginBottom: 35,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grey,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: textcolors.black,
  },
  button: {
    backgroundColor: colors.header,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: textcolors.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  greybutton: {
    flexDirection: 'row',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.othergrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: colors.black,
  },
})