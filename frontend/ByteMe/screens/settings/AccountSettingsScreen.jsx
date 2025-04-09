import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Button, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '../../components/Colors'
import { textcolors } from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

import { MaterialIcons, Ionicons } from '@expo/vector-icons'; 

import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from '@react-navigation/native';

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const AccountSettingsScreen = () => {
    // const router = useRouter();
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles_account.safeArea}>
            <ScrollView style={styles_account.scrollView}>
                <View style={styles_account.container}>
                    {/* Header Section */}
                    <BackButton />

                    <Text style={[styles.title]}>Account Information</Text>
                    <Text style={[styles.regularText, {paddingBottom: 20}]}>See and edit your account information.</Text>

                    {/* Account edit List */}
                    <TouchableOpacity 
                        style={styles_account.settingItem}
                        onPress={() => navigation.navigate('update_pass')}>
                        <MaterialIcons name="tune" size={40} color="#000000" />
                        <View style={styles_account.textContainer}>
                            <Text style={[styles_account.settingTitleText, {fontWeight: 'bold'}]}>
                                Reset Password
                            </Text>
                            <Text style={styles_account.settingDescriptionText}>
                                See how you can reset your {"\n"}
                                password.
                            </Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles_account.settingItem}
                        onPress={() => navigation.navigate('verify_pass')}>
                        <MaterialIcons name="tune" size={40} color="#000000" />
                        <View style={styles_account.textContainer}>
                            <Text style={[styles_account.settingTitleText, {fontWeight: 'bold'}]}>
                                Delete Account
                            </Text>
                            <Text style={styles_account.settingDescriptionText}>
                                See how you can delete your {"\n"}
                                account.
                            </Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles_account = StyleSheet.create({
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
    settingsText: {
        flex: 1,
        fontSize: 18,
        color: '#000000',
        marginLeft: 10,
    },
    settingsButton: {
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
    textContainer: { 
        flex: 1,             
        marginLeft: 15,  
    },
    settingTitleText: {     
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 3,
        fontFamily: fonts.semiBold
    },
    settingDescriptionText: { 
        fontSize: 14,
        color: '#666',
        fontFamily: fonts.regular
    },
});

export default AccountSettingsScreen;