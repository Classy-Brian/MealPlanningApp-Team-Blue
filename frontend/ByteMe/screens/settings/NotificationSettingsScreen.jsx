import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../../components/Colors';
import { textcolors} from '../../components/TextColors';
import { fonts } from '../../components/Fonts';
import { styles } from '@/components/Sheet'; 
import backarrow from "@/assets/images/back_arrow_navigate.png";

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Account Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const NotificationSettingsScreen = () => {
    const navigation = useNavigation();
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);
    const [isSaveConfirmEnabled, setIsSaveConfirmEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getTokenAndSetupAxios = async () => {
             console.log("Setting up Auth...");
             setIsLoading(true);
             setError(null);
             let storedToken = null;
             try {
                 storedToken = await AsyncStorage.getItem('authToken');
                 if (storedToken) {
                     console.log("Token found, setting axiosInstance.");
                     setToken(storedToken);
                     setAxiosInstance(() => axios.create({
                         baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                         headers: { Authorization: `Bearer ${storedToken}` },
                     }));
                 } else {
                     console.log("Token not found.");
                     Alert.alert("Error", "Authentication token not found.");
                     setError("Authentication token not found.");
                     setIsLoading(false);
                 }
             } catch (error) {
                 console.error("Error getting token:", error);
                 Alert.alert("Error", "Failed to load session.");
                 setError("Failed to load session.");
                 setIsLoading(false);
             }
        };
        getTokenAndSetupAxios();
    }, []); 

    const fetchUserSettings = async () => {
        if (!axiosInstance) {
            console.log("fetchUserSettings: Axios instance not ready yet, skipping fetch.");
            return;
        }

        console.log("Fetching user settings...");
        setError(null);

        try {
            const response = await axiosInstance.get(`/api/users/profile/${token}`);

            console.log("Settings fetch response data:", response.data);

            const currentSetting = response.data?.settings?.emailNotifications?.saveConfirmation !== false;

            setIsSaveConfirmEnabled(currentSetting);
            console.log("Setting saveConfirmation state to:", currentSetting);

        } catch (err) {
            console.error("Error fetching user settings:", err);
            let message = "Could not load your current settings.";
            if (err.response?.data?.message) { message = err.response.data.message; }
            setError(message);
            Alert.alert("Error Loading Settings", message);
        } finally {
            setIsLoading(false);
            console.log("Finished fetching settings attempt.");
        }
    };

    useEffect(() => {
        if (axiosInstance) {
            fetchUserSettings();
        }
    }, [axiosInstance]);


    const handleToggleSaveConfirm = async (newValue) => {
        console.log("Switch toggled to:", newValue);

        const originalValue = isSaveConfirmEnabled;
        setIsSaveConfirmEnabled(newValue);

        if (!axiosInstance) {
            console.error("Axios instance not ready, cannot save setting.");
            Alert.alert("Error", "Session not ready. Please wait and try again.");
            setIsSaveConfirmEnabled(originalValue);
            return;
        }

        try {
            const payload = { saveConfirmation: newValue };
            console.log(`Attempting to PATCH /api/users/settings/notifications with payload:`, payload);

            const response = await axiosInstance.patch('/api/users/settings/notifications', payload);

            console.log("Setting update successful:", response.data);

        } catch (err) {
            console.error("Error updating notification setting:", err);
            let message = "Could not update setting.";
            if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            Alert.alert("Update Failed", message);

            setIsSaveConfirmEnabled(originalValue);
        }
    };

    return (
        <ScrollView style={localStyles.container}>
            <BackButton />

            <Text style={localStyles.title}>Notification Settings</Text>

            <View style={localStyles.section}>
                <Text style={localStyles.sectionTitle}>Email Notifications</Text>

                <View style={localStyles.settingRow}>
                    <Text style={localStyles.settingLabel}>Confirm when meal plan is saved?</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: colors.primary || "#81b0ff" }}
                        thumbColor={"#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={handleToggleSaveConfirm}
                        value={isSaveConfirmEnabled}
                        disabled={isLoading}
                    />
                </View>

                 {/* Add indicator while fetching initial settings */}
                {isLoading && <ActivityIndicator style={{marginTop: 10}} />}
                {/* Display fetch error */}
                {error && <Text style={localStyles.errorText}>{error}</Text>}


                {/* Add more notification toggles here later */}
            </View>

        </ScrollView>
    );
};

const localStyles = StyleSheet.create({
     container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
     },
     title: {
         fontSize: 26,
         fontWeight: 'bold',
         color: '#000',
         marginTop: 10,
         marginBottom: 25,
         paddingHorizontal: 20,
     },
     section: {
         backgroundColor: '#FFFFFF',
         borderRadius: 10,
         marginHorizontal: 15,
         marginBottom: 20,
         paddingHorizontal: 15,
     },
     sectionTitle: {
         fontSize: 18,
         fontWeight: '600',
         color: '#333',
         paddingTop: 15,
         paddingBottom: 5,
     },
     settingRow: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         paddingVertical: 15,
     },
     settingLabel: {
         fontSize: 16,
         color: '#000',
         flex: 1,
         marginRight: 10,
     },
     errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 10,
        paddingHorizontal: 15,
        fontSize: 14,
     }
});

export default NotificationSettingsScreen;