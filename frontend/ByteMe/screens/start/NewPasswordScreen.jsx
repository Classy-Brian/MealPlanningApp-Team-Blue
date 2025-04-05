import React, { useState } from 'react';
import {
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    SafeAreaView, 
    Alert, 
    ActivityIndicator, 
    Image,
    Keyboard
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
// import { styles } from '@/components/Sheet'

const NewPasswordScreen = ({ navigation, route }) => {
    const { email = '', resetToken = '' } = route.params || {}; 

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); 

    const handleSetNewPassword = () => {
        // Basic Validation
        if (!newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert("Error", "Please enter and confirm your new password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        // if (newPassword.length < 6) {
        //      Alert.alert("Error", "Password must be at least 6 characters long.");
        //      return;
        // }

        Keyboard.dismiss();

        setIsLoading(true);
        console.log("Mock: Pretending to set new password for:", email);
        console.log("Mock: Using reset token:", resetToken); 

        setTimeout(() => {
            setIsLoading(false);
            Alert.alert("Success", "Password has been reset successfully! Please log in with your new password.");
            // navigation.navigate('login');
            navigation.reset({
                index: 0,
                routes: [{ name: 'login' }],
            });
        }, 1500);

        const submitNewPassword = async () => {
            setIsLoading(true);
            setError(null);
            try {
            // Replace with actual API call to reset the password
            // Backend needs an endpoint like POST /api/users/reset-password
            // It should expect email, the *verified* resetToken (from verify code step), and newPassword
            // const response = await axiosInstance.post(process.env.EXPO_PUBLIC_BACKEND_URL + '/api/users/reset-password', {
            //     email,
            //     resetToken: resetToken, // Or whatever token backend provides after code verification
            //     newPassword
            // });
            // console.log("Reset password response:", response.data);

            // MOCK Success:
            console.log("Mock: Pretending to set new password for:", email);
            // Alert.alert("Success", "Password has been reset successfully! Please log in.");
            // navigation.navigate('login');

            Alert.alert("Success", "Password has been reset successfully! Please log in.");
            navigation.reset({ index: 0, routes: [{ name: 'login' }] });

            } catch (error) {
                console.error("Set New Password Error:", error);
                const message = error.response?.data?.message || "Could not reset password. Please try again.";
                Alert.alert("Error", message);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        // submitNewPassword();  
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Create New Password</Text>
                <Text style={styles.subtitle}>Enter your new password below.</Text>

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                     <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!isNewPasswordVisible}
                            autoCapitalize="none"
                            textContentType="newPassword"
                        />
                         <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)} style={styles.eyeIcon}>
                             <Ionicons name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={textcolors.grey} />
                         </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm New Password Input */}
                <View style={styles.inputContainer}>
                     <Text style={styles.label}>Confirm New Password</Text>
                     <View style={styles.passwordInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isConfirmPasswordVisible} 
                            autoCapitalize="none"
                            textContentType="newPassword"
                        />
                         <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                             <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={textcolors.grey} />
                         </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSetNewPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={textcolors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Set New Password</Text>
                    )}
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default NewPasswordScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 60,
    },
     title: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginBottom: 30,
        textAlign: 'center',
    },
     label: {
        fontSize: 14,
        color: textcolors.darkgrey,
        marginBottom: 8,
        fontFamily: fonts.regular,
    },
    inputContainer: {
        marginBottom: 25,
    },
     passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.grey,
        borderRadius: 8,
        backgroundColor: colors.white,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        fontFamily: fonts.regular,
        color: textcolors.black,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: colors.header,
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
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
});