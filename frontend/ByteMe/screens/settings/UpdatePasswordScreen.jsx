import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, Alert, ActivityIndicator, Keyboard, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'


const backArrowImage = require('../../assets/images/back_arrow_navigate.png');

const UpdatePasswordScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { from } = params;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);

    useEffect(() => {
        const getTokenAndSetupAxios = async () => {
            let storedToken = null;
            try {
                storedToken = await AsyncStorage.getItem('authToken');
                if (storedToken) {
                    setToken(storedToken);
                    setAxiosInstance(() => axios.create({
                        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }));
                } else {
                    setError("Not logged in.");
                    Alert.alert("Authentication Error", "Please log in again.");
                }
                } catch (error) {
                console.error("Error getting tocken:", error);
                Alert.alert("Error", "Failed to load authentication token.");
            }
        };
        getTokenAndSetupAxios();
    }, []);

    const handleUpdatePassword = async () => {
        // Validations
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert("Error", "Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        Keyboard.dismiss();

        if (!axiosInstance) {
            Alert.alert("Error", "Session invalid. Please log in again.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log("Attempting to update password")
            const response = await axiosInstance.patch('/api/users/profile/password', {
                currentPassword: currentPassword,
                newPassword: newPassword
            });

            console.log("Update password response:", response.data);

            setIsLoading(false);
            Alert.alert("Success", response.data?.message || "Password updated successfully!");

            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/settings');
            }

        } catch(error) {
            console.error("Update Password Error:", error);
            let errorMessage = "Could not update password. Please try again.";
            if (error.response) {
                console.error("Backend Error Data:", error.response.data);
                errorMessage = error.response.data?.message || `Server Error (${error.response.status})`;
                 if (error.response.status === 401) {
                      errorMessage = "Incorrect current password.";
                 }
            } else if (error.request) {
                console.error("Network Error Data:", error.request.data);
                errorMessage = error.request.data?.message || `Server Error (${error.request.status})`; 
            }

            Alert.alert("Error", errorMessage);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles_updatePass.safeArea}>
            <View style={styles_updatePass.container}>
                {/* Header */}
                 <View style={styles_updatePass.header}>
                    <TouchableOpacity
                        style={styles_updatePass.settingsButton}
                        onPress={() => router.back()} 
                    >
                        <Image style={{marginRight:10}} source={backArrowImage}/>
                        <Text style={styles_updatePass.settingsText}>Account Settings</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.title, {marginTop: 10}]}>{from}</Text>
                <Text style={styles_updatePass.normalText}>
                    Create a new password. {'\n'} 
                    Ensure it differs from previous ones for security.
                </Text>

                {/* Current Password Input */}
                <View style={styles_updatePass.inputContainer}>
                    <Text style={styles_updatePass.label}>Current Password</Text>
                    <View style={styles_updatePass.passwordInputWrapper}>
                        <TextInput
                            style={styles_updatePass.input}
                            placeholder="Enter current password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!isCurrentPasswordVisible}
                            autoCapitalize="none"
                            textContentType="password"
                        />
                        <TouchableOpacity onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)} style={styles_updatePass.eyeIcon}>
                            <Ionicons name={isCurrentPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.grey} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* New Password Input */}
                <View style={styles_updatePass.inputContainer}>
                    <Text style={styles_updatePass.label}>New Password</Text>
                    <View style={styles_updatePass.passwordInputWrapper}>
                        <TextInput
                            style={styles_updatePass.input}
                            placeholder="Enter new password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!isNewPasswordVisible}
                            autoCapitalize="none"
                            textContentType="newPassword"
                        />
                        <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)} style={styles_updatePass.eyeIcon}>
                            <Ionicons name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.grey} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm New Password Input */}
                <View style={styles_updatePass.inputContainer}>
                    <Text style={styles_updatePass.label}>Confirm New Password</Text>
                    <View style={styles_updatePass.passwordInputWrapper}>
                        <TextInput
                            style={styles_updatePass.input}
                            placeholder="Confirm new password"
                            placeholderTextColor={textcolors.lightgrey}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isConfirmPasswordVisible}
                            autoCapitalize="none"
                            textContentType="newPassword"
                        />
                        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles_updatePass.eyeIcon}>
                            <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color={colors.grey} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles_updatePass.button, isLoading && styles_updatePass.buttonDisabled]}
                    onPress={handleUpdatePassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={textcolors.white} />
                    ) : (
                        <Text style={styles_updatePass.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );

};

const styles_updatePass = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.white, },
    container: { flex: 1, paddingHorizontal: 30, paddingTop: 20, },
    headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 5, },
    backButtonText: { fontSize: 16, marginLeft: 6, fontFamily: fonts.regular, color: textcolors.link, },
    title: { fontSize: 24, fontWeight: 'bold', fontFamily: fonts.bold, color: textcolors.black, textAlign: 'center', flex: 1 },
    label: { fontSize: 14, color: textcolors.darkgrey, marginBottom: 8, fontFamily: fonts.regular, },
    inputContainer: { marginBottom: 20, },
    passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.grey, borderRadius: 8, backgroundColor: colors.white, },
    input: { flex: 1, paddingVertical: 15, paddingHorizontal: 15, fontSize: 16, fontFamily: fonts.regular, color: textcolors.black, },
    eyeIcon: { padding: 10, },
    button: { backgroundColor: colors.header, paddingVertical: 18, borderRadius: 10, alignItems: 'center', marginTop: 30, },
    buttonDisabled: { opacity: 0.6, },
    buttonText: { color: textcolors.white, fontSize: 18, fontWeight: 'bold', fontFamily: fonts.bold, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 40, marginBottom: 20, },
    settingsButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 0, top: 0, borderRadius: 15, paddingHorizontal: 15,
        paddingVertical: 5, backgroundColor: colors.othergrey, justifyContent: 'center', marginVertical: 20, elevation: 2, shadowColor: colors.black, },
    settingsText: { fontSize: 20, marginLeft: 5, },
    normalText: { fontSize: 16, marginBottom: 20, },
});



export default UpdatePasswordScreen;