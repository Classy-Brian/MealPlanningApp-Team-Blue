import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Button, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors } from '../../components/Colors'
import { textcolors } from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'

import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons

const PreferenceSettingsScreen = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles_preference.safeArea}>
            <ScrollView style={styles_preference.scrollView}>
                <View style={styles_preference.container}>
                    {/* Header Section */}
                    <View style={styles_preference.header}>
                        <TouchableOpacity
                            style={styles_preference.settingsButton}
                            onPress={() => router.back()} 
                        >
                            <Image style={{marginRight:10}}
                                source={require('../../assets/images/back_arrow_navigate.png')}/>
                            <Text style={styles_preference.settingsText}>Settings</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.title]}>Preference Settings</Text>
                    <Text style={[styles.regularText, {paddingBottom: 20}]}>Manage your overall preferences.{'\n'}Including allergens, your portion sizes and more.</Text>

                    {/* Preference List */}
                    <Link href={{ pathname: "/(settings)/portion", params: { from: 'Portion Size' } }} asChild>
                        <TouchableOpacity style={styles_preference.settingItem}>
                            <MaterialIcons name="tune" size={40} color="#000000" />
                            <View style={styles_preference.textContainer}>
                                <Text style={[styles_preference.settingTitleText, {fontWeight: 'bold'}]}>
                                    Portion Size
                                </Text>
                                <Text style={styles_preference.settingDescriptionText}>
                                    Select your preferred portion size.
                                </Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                        </TouchableOpacity>
                    </Link>

                    <Link href={{ pathname: "/(settings)/allergies", params: { from: 'Allergies' } }} asChild>
                        <TouchableOpacity style={styles_preference.settingItem}>
                            <MaterialIcons name="tune" size={40} color="#000000" />
                            <View style={styles_preference.textContainer}>
                                <Text style={[styles_preference.settingTitleText, {fontWeight: 'bold'}]}>
                                    Allergies
                                </Text>
                                <Text style={styles_preference.settingDescriptionText}>
                                    Select ingredients that cause you {"\n"}
                                    to have allergies..
                                </Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity style={styles_preference.settingItem}>
                        <MaterialIcons name="tune" size={40} color="#000000" />
                        <View style={styles_preference.textContainer}>
                            <Text style={[styles_preference.settingTitleText, {fontWeight: 'bold'}]}>
                                Disliked Ingredients
                            </Text>
                            <Text style={styles_preference.settingDescriptionText}>
                                Select your disliked ingredients.
                            </Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    <Link href={{ pathname: "/(settings)/cuisine", params: { from: 'Cuisines' } }} asChild>
                        <TouchableOpacity style={styles_preference.settingItem}>
                            <MaterialIcons name="tune" size={40} color="#000000" />
                            <View style={styles_preference.textContainer}>
                                <Text style={[styles_preference.settingTitleText, {fontWeight: 'bold'}]}>
                                    Cuisines
                                </Text>
                                <Text style={styles_preference.settingDescriptionText}>
                                    Select the type(s) of cuisines that {"\n"}
                                    you'd like to see more recipes of.
                                </Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity style={styles_preference.settingItem}>
                        <MaterialIcons name="tune" size={40} color="#000000" />
                        <View style={styles_preference.textContainer}>
                            <Text style={[styles_preference.settingTitleText, {fontWeight: 'bold'}]}>
                                Preset Meal Plans
                            </Text>
                            <Text style={styles_preference.settingDescriptionText}>
                                Select the type(s) of meal plans {"\n"}
                                you'd like to see more of.
                            </Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles_preference = StyleSheet.create({
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

export default PreferenceSettingsScreen;