import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Button, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '../../components/Colors'
import { textcolors } from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

const SettingsScreen = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken');
            router.replace('/(start)/login')
        } catch (error) {
            console.error("Error logging out:", error)
            Alert.alert("Error", "Could not log out. Please try again.")
        }
    };


    return (
        <SafeAreaView style={styles_settings.safeArea}>
            <ScrollView style={styles_settings.scrollView}>
                <View style={styles_settings.container}>
                    {/* Header Section */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Link href="/profile" asChild>
                            <TouchableOpacity>
                                <View style={[ styles_settings.greybutton ]}>
                                    <Image style={{marginRight:10}}
                                            source={require('../../assets/images/back_arrow_navigate.png')}/>
                                    <Text style={styles.regularText}>Profile</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <Text style={[styles.title, {marginTop: 10}]}>Settings </Text>

                    {/* Search Bar (Placeholder) */}
                    <View style={styles_settings.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#888" style={styles_settings.searchIcon} />
                        <TextInput
                            style={styles_settings.searchInput}
                            placeholder="Search Settings"
                            placeholderTextColor="#888"
                            editable={false} 
                        />
                    </View>

                    {/* Settings List */}
                    <Link href={{ pathname: "/(settings)/preferences", params: { from: 'Allergies' } }} asChild>
                        <TouchableOpacity style={styles_settings.settingItem}>
                            <MaterialIcons name="tune" size={40} color="#000000" />
                            <Text style={[styles.regularText, {marginLeft: 20}]}>
                                Preference Settings {"\n"}
                                Edit your food preferences. 
                            </Text>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity style={styles_settings.settingItem}>
                        <MaterialIcons name="account-circle" size={40} color="#000000" />
                        <Text style={[styles.regularText, {marginLeft: 20}]}>
                            Account Settings {"\n"}
                            See your account information.
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles_settings.settingItem}>
                        <MaterialIcons name="notifications" size={40} color="#000000" />
                        <Text style={[styles.regularText, {marginLeft: 20}]}>
                            Notification Settings {"\n"}
                            Choose the notifications that you'd like to see.
                        </Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <View style={styles_settings.logoutButtonContainer}>
                        <Button title="Log Out" onPress={handleLogout} color="#C0776E" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles_settings = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff', 
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',   
        height: 60, 
        marginBottom: 40, 
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
    profileText: {
        fontSize: 20,
        marginLeft: 5,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#000',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: "#ECF1F9"
    },
    settingText: {
        flex: 1,
        fontSize: 18,
        color: '#000000',
        marginLeft: 10,
    },
     logoutButtonContainer: {
        marginTop: 20,
    },
});

export default SettingsScreen;