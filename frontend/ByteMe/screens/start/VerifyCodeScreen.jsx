// screens/start/VerifyCodeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Keyboard,
    Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
// import { styles } from '@/components/Sheet'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');

const VerifyCodeScreen = ({ navigation, route }) => {
    const { email = "your email" } = route.params || {};
    const [code, setCode] = useState(['', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const inputRefs = useRef([]); // Refs for input fields to manage focus automatically

    useEffect(() => {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, []);

    const handleInputChange = (text, index) => {
        // Allow only digits and limit to 1 character
        const digit = text.replace(/[^0-9]/g, '');
        if (digit.length <= 1) {
            const newCode = [...code];
            newCode[index] = digit;
            setCode(newCode);

            // Auto-focus next input if a digit was entered
            if (digit && index < code.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
            // Auto-focus previous input if digit was deleted (Backspace)
            else if (!digit && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        // Dismiss keyboard if last digit is entered
        if (digit && index === code.length - 1) {
            Keyboard.dismiss();
        }
    };

    const handleVerifyCode = () => {
        const enteredCode = code.join('');
        if (enteredCode.length !== 5) {
            Alert.alert("Invalid Code", "Please enter the complete 5-digit code.");
            return;
        }

        console.log("Proceeding to set new password for:", email);
        console.log("Passing code:", enteredCode);

        // Navigate to NewPasswordScreen, passing email and the entered code
        navigation.navigate('newpassword', {
            email: email,
            code: enteredCode
        });
    };

    const handleResendCode = async () => {
        setIsResending(true);
        console.log("Resending code for:", email);
        try {
             const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
             const response = await axios.post(`${backendUrl}/api/users/forgot-password`, { email });

            Alert.alert("Code Resent", response.data?.message || `If an account exists for ${email}, a new code has been sent.`);

        } catch (error) {
            console.error("Resend Code Error:", error);
            const message = error.response?.data?.message || "Could not resend code. Please try again.";
            Alert.alert("Error Resending Code", message);
        } finally {
             setIsResending(false);
        }
    };

  return (
      <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
              {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Image style={{marginRight:10}} source={backArrowImage}/>
                  <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                  We sent a reset link to <Text style={styles.emailText}>{email}</Text> enter 5 digit code that mentioned in the email.
              </Text>

              {/* Code Input Fields */}
              <View style={styles.codeInputContainer}>
                  {code.map((digit, index) => (
                      <TextInput
                          key={index}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          style={styles.codeInput}
                          value={digit}
                          onChangeText={(text) => handleInputChange(text, index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus={true}
                      />
                  ))}
              </View>

              <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={isLoading}
              >
                  {isLoading ? (
                      <ActivityIndicator color={textcolors.white} />
                  ) : (
                      <Text style={styles.buttonText}>Verify Code</Text>
                  )}
              </TouchableOpacity>

              {/* Resend Link */}
              <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Haven't got the email yet? </Text>
                  <TouchableOpacity onPress={handleResendCode}>
                      <Text style={styles.resendLink}>Resend email</Text>
                  </TouchableOpacity>
              </View>

          </View>
      </SafeAreaView>
  );
};


const styles = StyleSheet.create({
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
        backgroundColor: colors.othergrey,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 30,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    backButtonText: {
        fontSize: 16,
        marginLeft: 6,
        fontFamily: fonts.regular,
        color: textcolors.black,
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
        marginBottom: 40,
        fontFamily: fonts.regular,
        lineHeight: 22,
    },
    emailText: {
        fontWeight: 'bold',
        color: textcolors.black,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    codeInput: {
        borderWidth: 1,
        borderColor: colors.grey,
        borderRadius: 8,
        width: 50,
        height: 60,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: fonts.bold,
        color: textcolors.black,
        backgroundColor: colors.white,
    },
    button: {
        backgroundColor: colors.header,
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
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
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    resendText: {
        fontSize: 14,
        color: textcolors.darkgrey,
        fontFamily: fonts.regular,
    },
    resendLink: {
        fontSize: 14,
        color: colors.header,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        marginLeft: 4,
    },
});

export default VerifyCodeScreen;