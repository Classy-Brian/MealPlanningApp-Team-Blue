import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';

const SettingsScreen = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Settings</Text>

                <Link href={{ pathname: "/(settings)/preferences", params: { from: 'Allergies' } }} asChild>
                    <TouchableOpacity style={styles.settingItem}>
                        <Text style={styles.settingText}>Preference Settings</Text>
                    </TouchableOpacity>
                </Link>

                {/* Add other setting options here later (Account, Notifications) */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    settingItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    settingText: {
        fontSize: 18,
    },
});

export default SettingsScreen;