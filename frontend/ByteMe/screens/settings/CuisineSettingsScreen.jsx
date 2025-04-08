import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions, Alert, SafeAreaView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios';
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'
import { Checkbox } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'

const chineseFood = require('../../assets/images/chinese_food_icon.png'); 
const seafoodFood = require('../../assets/images/seafood_food_icon.png'); 
const japaneseFood = require('../../assets/images/japanese_food_icon.png'); 
const americanFood = require('../../assets/images/american_food_icon.png'); 
const italianFood = require('../../assets/images/italian_food_icon.png'); 
const mexicanFood = require('../../assets/images/mexican_food_icon.png'); 
const backArrowImage = require('../../assets/images/back_arrow_navigate.png');
const nextArrowImage = require('../../assets/images/next_arrow_navigate.png');
const nextButtonImage = require('../../assets/images/next_arrow.png');
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from "@react-navigation/native";

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('preference_settings')}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Preference Settings</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const CuisineSettingScreen = () => {
    const [cuisines, setSelectedCuisines] = useState([]);
    const params = useLocalSearchParams();
    const { from } = params;
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [axiosInstance, setAxiosInstance] = useState(null);

    const options = ['Chinese', 'Seafood', 'Japanese', 'American', 'Italian', 'Mexican'];

    useEffect(() => {
        const getToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken')
                if (storedToken) {
                    setToken(storedToken);
                    setAxiosInstance(() => axios.create({
                        baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }));
                } else {
                    Alert.alert("Error", "Not logged in. Please log in first");
                }
            } catch (error) {
                console.error("Error getting tocken:", error);
                Alert.alert("Error", "Failed to load authentication token.");
            }
        };
        getToken();
    }, []);

    const fetchUserData = async () => {
        if (!axiosInstance) return;

        try {
            console.log("Fetching user data for portion size");
            const response = await axiosInstance.get(`/api/users/profile/${token}`)
            const userCuisine = response.data.cuisines
            setSelectedCuisines(userCuisine)

        } catch (error) {
            console.error("Error, fetching user data:", error);
            if (err.response && error.response.status === 404) {
                Alert.alert("Error", "User profile not found.");
            } else if (err.response && error.response.status === 401) {
                Alert.alert("Error", "Unauthorized. Please log in again.");
            } else {
                Alert.alert("Error", "Could not load portion data.");
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [axiosInstance]); 

    const toggleSelection = (option) => {
        setSelectedCuisines((prev) =>
            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
        );
    };

    const renderCuisineItem = ({ item }) => (
        <View style={styles_cuisine.cuisineItem}>
            <Checkbox.Android
                status={cuisines.includes(item) ? 'checked' : 'unchecked'} // Use selectedCuisines state
                onPress={() => toggleSelection(item)}
                color="#284B63"
            />
            <Text style={styles_cuisine.cuisineText}>{item}</Text>
        </View>
    );

    const saveCuisines = async () => {
        try {
            console.log("cuisines to send:", cuisines);

            const axiosInstance = axios.create({
                baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });

            await axiosInstance.patch(`/api/users/preferences`, { cuisines: cuisines });
            Alert.alert("Success", "Cuisines updated successfully!");
            fetchUserData();

        } catch (err) {
            console.error("Error updating cuisines:", error);
            Alert.alert("Error", "Could not update cuisines. Please try again.");
        } 
    };

    return (
        <SafeAreaView style={styles_cuisine.safeArea}>
            <View style={styles_cuisine.container}>

                <BackButton />

                <Text style={[styles.title, {marginTop: 10}]}>Cuisines</Text>
                <Text style={styles_cuisine.normalText}>Select the cuisines you like most for your recommendations.</Text>

            <FlatList
                data={options}
                renderItem={renderCuisineItem}
                keyExtractor={(item) => item}
                style={styles_cuisine.list}
            />

                <TouchableOpacity
                    style={styles_cuisine.saveButton}
                    onPress={saveCuisines}
                >
                    <Text style={styles_cuisine.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles_cuisine = StyleSheet.create({
    cuisineItem: {
        flexDirection: 'row',
        alignItems: 'center', 
        marginBottom: 10, 
    },
    cuisineText: {
        fontSize: 16,
        marginLeft: 10, 
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
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
        height: 40, 
        marginBottom: 20, 
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
    settingsText: {
        fontSize: 20,
        marginLeft: 5,
    },
    normalText: {
        fontSize: 16,
        marginBottom: 20,
    },
    list: {
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: colors.header, 
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20, 
        alignSelf: 'center', 
        minWidth: 150, 
    },
    saveButtonText: {
        color: textcolors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CuisineSettingScreen;