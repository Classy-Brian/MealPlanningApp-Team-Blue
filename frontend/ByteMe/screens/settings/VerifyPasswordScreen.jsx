import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, Alert, ActivityIndicator, Keyboard, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { colors } from '../../components/Colors'
import { textcolors } from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');

const VerifyPasswordScreen = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);
    const params = useLocalSearchParams();
    const { from } = params;

    useEffect(() => {
        const getTokenAndSetupAxios = async () => {
            let storedToken = null;
            try {
                storedToken = await AsyncStorage.getItem('authToken');
                if (storedToken) {
                    setToken(storedToken);
                    setAxiosInstance(() => axios.create({
                        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                        headers: { Authorization: `Bearer ${storedToken}` },
                    }));
                } else {
                    Alert.alert("Authentication Error", "Please log in again.");
                    router.replace('/(start)/login');
                }
            } catch (error) {
                console.error("Error getting token:", error);
                Alert.alert("Error", "Failed to load session.");
                setError("Failed to load session.");
            }
        };
        getTokenAndSetupAxios();
    }, []);

    const handleVerifyPassword = async () => {
        if (!currentPassword.trim()) {
            Alert.alert("Error", "Please enter your current password.");
            return;
        }
        Keyboard.dismiss();
        setIsLoading(true);
        setError(null);

        try {
            console.log("Verifying current password...");
            const response = await axiosInstance.post('/api/users/verify-password', {
                password: currentPassword
            });

            console.log("Password verification response:", response.data);

            setIsLoading(false);
            router.push('/(settings)/confirmdelete');

        } catch (error) {
            setIsLoading(false);
            console.error("Verify Password Error:", error);
            let errorMessage = "Could not verify password. Please try again.";
            if (error.response) {
                errorMessage = error.response.data?.message || `Verification failed (${error.response.status})`;
                 if (error.response.status === 401) {
                     errorMessage = "Incorrect password.";
                 }
            } else if (error.request) {
                errorMessage = "Cannot reach server. Check connection.";
            } else {
                errorMessage = error.message || errorMessage;
            }
            Alert.alert("Verification Failed", errorMessage);
            setError(errorMessage);
        }
        
    };

    return (
        <SafeAreaView style={styles_verifPass.safeArea}>
            <View style={styles_verifPass.container}>

                <View style={styles_verifPass.header}>
                    <TouchableOpacity
                        style={styles_verifPass.settingsButton}
                        onPress={() => router.back()} 
                    >
                        <Image style={{marginRight:10}} source={backArrowImage}/>
                        <Text style={styles_verifPass.settingsText}>Account Settings</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, {marginTop: 10}]}>{from}</Text>
                <Text style={styles_verifPass.normalText}>
                For your security, please enter your current password to proceed with account deletion.
                </Text>

                <View style={styles_verifPass.inputContainer}>
                     <Text style={styles_verifPass.label}>Current Password</Text>
                    <View style={styles_verifPass.passwordInputWrapper}>
                        <TextInput
                            style={styles_verifPass.input}
                            placeholder="Enter current password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!isPasswordVisible}
                            autoCapitalize="none"
                            textContentType="password"
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles_verifPass.eyeIcon}>
                            <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.grey} />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles_verifPass.button, isLoading && styles_verifPass.buttonDisabled]}
                    onPress={handleVerifyPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={textcolors.white} />
                    ) : (
                        <Text style={styles_verifPass.buttonText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default VerifyPasswordScreen;

const styles_verifPass = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.white, },
    container: { flex: 1, paddingHorizontal: 30, paddingTop: 20, },
    backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 30, paddingVertical: 5 },
    backButtonText: { fontSize: 16, marginLeft: 6, fontFamily: fonts.regular, color: colors.header, },
    title: { fontSize: 28, fontWeight: 'bold', fontFamily: fonts.bold, color: textcolors.black, marginBottom: 15, textAlign: 'center' },
    subtitle: { fontSize: 16, color: textcolors.darkgrey, marginBottom: 35, fontFamily: fonts.regular, lineHeight: 22, textAlign: 'center' },
    inputContainer: { marginBottom: 25, },
    label: { fontSize: 14, color: textcolors.darkgrey, marginBottom: 8, fontFamily: fonts.regular, },
    passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.grey, borderRadius: 8, backgroundColor: colors.white, },
    input: { flex: 1, paddingVertical: 15, paddingHorizontal: 15, fontSize: 16, fontFamily: fonts.regular, color: textcolors.black, },
    eyeIcon: { padding: 10, },
    button: { backgroundColor: colors.header, paddingVertical: 18, borderRadius: 10, alignItems: 'center', marginTop: 20, },
    buttonDisabled: { opacity: 0.6, },
    buttonText: { color: textcolors.white, fontSize: 18, fontWeight: 'bold', fontFamily: fonts.bold, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 40, marginBottom: 20, },
    settingsButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 0, top: 0, borderRadius: 15, paddingHorizontal: 15,
        paddingVertical: 5, backgroundColor: colors.othergrey, justifyContent: 'center', marginVertical: 20, elevation: 2, shadowColor: colors.black, },
    settingsText: { fontSize: 20, marginLeft: 5, },
    normalText: { fontSize: 16, marginBottom: 20, },
});
