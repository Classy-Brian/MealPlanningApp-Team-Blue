import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Button, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Import icons
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Link href="/profile" asChild>
                            <TouchableOpacity style={styles.profileButton}>
                                 <Ionicons name="arrow-back" size={24} color="black" />
                                <Text style={styles.profileText}>Profile</Text>
                            </TouchableOpacity>
                        </Link>
                        <Text style={styles.title}>Settings</Text>
                        <View style={{width: 85}}></View>
                    </View>

                    {/* Search Bar (Placeholder) */}
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Settings"
                            placeholderTextColor="#888"
                            editable={false} 
                        />
                    </View>

                    {/* Settings List */}
                    <Link href={{ pathname: "/(settings)/preferences", params: { from: 'Allergies' } }} asChild>
                        <TouchableOpacity style={styles.settingItem}>
                            <MaterialIcons name="tune" size={24} color="#000000" />
                            <Text style={styles.settingText}>Preference Settings</Text>
                            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity style={styles.settingItem}>
                        <MaterialIcons name="account-circle" size={24} color="#000000" />
                        <Text style={styles.settingText}>Account Settings</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <MaterialIcons name="notifications" size={24} color="#000000" />
                        <Text style={styles.settingText}>Notification Settings</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color="#000000" />
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <View style={styles.logoutButtonContainer}>
                        <Button title="Log Out" onPress={handleLogout} color="#D80032" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
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
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', 
        left: 0,
        top: 0,
    },
    profileText: {
        fontSize: 20,
        marginLeft: 5,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        marginTop: 60,       
        textAlign: 'start', 
        flex: 1, 
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