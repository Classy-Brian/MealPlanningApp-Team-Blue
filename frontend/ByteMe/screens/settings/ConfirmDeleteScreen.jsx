import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../components/Colors'
import { textcolors } from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from "@react-navigation/native";

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('account_settings')}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Account Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}
const ConfirmDeleteScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
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
                        headers: { Authorization: `Bearer ${storedToken}` },
                    }));
                } else {  
                    Alert.alert("Error", "Please log in."); router.replace('/(start)/login'); 
                }
            } catch (error) { 
                console.error("Error getting tocken:", error);
                Alert.alert("Error", "Failed to load authentication token.");
            }
        };
        getTokenAndSetupAxios();
    }, []);

    const performAccountDeletion = async () => {
        if (!axiosInstance) {
            Alert.alert("Error", "Session invalid.");
            return;
        }

        setIsLoading(true);

        try {
            console.log("Attempting to delete account...");

            const response = await axiosInstance.delete('/api/users/profile');
            console.log("Account deletion response:", response.data);

            setIsLoading(false);

            Alert.alert("Account Deleted", response.data?.message || "Your account has been successfully deleted.");

            await AsyncStorage.removeItem('authToken');

            router.replace('/(start)/login');

        } catch (error) {
            setIsLoading(false);
            console.error("Delete Account Error:", error);
            const message = error.response?.data?.message || "Could not delete account. Please try again.";
            Alert.alert("Error", message);
        }
    };

    return (
        <SafeAreaView style={styles_confirmDel.safeArea}>
            <View style={styles_confirmDel.container}>
                 {/* Back Button */}
                {/* <BackButton /> */}

                <Text style={styles_confirmDel.title}>Are you sure?</Text>
                <Text style={styles_confirmDel.subtitle}>
                    This action cannot be undone. All your data, including saved recipes and preferences, will be permanently lost.
                </Text>

                <View style={styles_confirmDel.buttonContainer}>
                    <TouchableOpacity
                        style={[styles_confirmDel.button, styles_confirmDel.deleteButton]}
                        onPress={performAccountDeletion}
                        disabled={isLoading}
                    >
                         {isLoading ? (
                            <ActivityIndicator color={textcolors.white} />
                        ) : (
                            <Text style={styles_confirmDel.buttonText}>Delete Account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles_confirmDel.button, styles_confirmDel.cancelButton]}
                        onPress={() => navigation.navigate('account_settings')}
                        disabled={isLoading}
                    >
                        <Text style={[styles_confirmDel.buttonText, styles_confirmDel.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default ConfirmDeleteScreen;

const styles_confirmDel = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.white, },
    container: { flex: 1, paddingHorizontal: 30, paddingTop: 20, justifyContent: 'space-between' }, 
    backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingBottom: 20 },
    backButtonText: { fontSize: 16, marginLeft: 6, fontFamily: fonts.regular, color: colors.header, },
    title: { fontSize: 28, fontWeight: 'bold', fontFamily: fonts.bold, color: textcolors.black, textAlign: 'center', marginTop: 40 }, 
    subtitle: { fontSize: 16, color: textcolors.darkgrey, fontFamily: fonts.regular, lineHeight: 22, textAlign: 'center', marginTop: 20, marginBottom: 'auto' },
    buttonContainer: { paddingBottom: 40 },
    button: { paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15, },
    deleteButton: { backgroundColor: 'red', },
    cancelButton: { backgroundColor: colors.othergrey, },
    buttonText: { color: textcolors.white, fontSize: 18, fontWeight: 'bold', fontFamily: fonts.bold, },
    cancelButtonText: { color: textcolors.black, },
    buttonDisabled: { opacity: 0.6, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 40, marginBottom: 20, },
    settingsButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 0, top: 0, borderRadius: 15, paddingHorizontal: 15,
        paddingVertical: 5, backgroundColor: colors.othergrey, justifyContent: 'center', marginVertical: 20, elevation: 2, shadowColor: colors.black, },
    settingsText: { fontSize: 20, marginLeft: 5, },
    normalText: { fontSize: 16, marginBottom: 20, },
});