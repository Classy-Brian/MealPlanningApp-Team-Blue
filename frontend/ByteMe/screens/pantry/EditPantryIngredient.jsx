import { Image, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '@/components/Sheet'
import { Divider } from 'react-native-paper'
import { textcolors } from '@/components/TextColors'
import { colors } from '@/components/Colors'
import { Ionicons } from '@expo/vector-icons'
import { fonts } from '@/components/Fonts'
import { useRouter } from 'expo-router'
import getUserIdFromToken from '@/components/getUserIdFromToken'
import axios from 'axios'
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { ScreenContainer } from 'react-native-screens'
import { useNavigation } from '@react-navigation/native'

function MinusButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={det.blueRoundButton}>
                <Ionicons name="remove" size={20} color='#000' />
            </View>
        </TouchableOpacity>
    )
}

function AddButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={det.blueRoundButton}>
                <Ionicons name="add" size={20} color='#000' />
            </View>
        </TouchableOpacity>
    )
}


function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('pantry1')}>
                <View style={[det.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Pantry</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

function AddIngredient( {ingredient, quantity} ) {
    const navigation = useNavigation();

    const handleSuggest = async () => {
        try {
            const userId = await getUserIdFromToken();
            if (!userId) {
                console.warn("User ID not found")
                return;
            }

            const response = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/update-pantry`, {
                foodId: ingredient?.foodId,
                quantity: quantity
            })

            if (response.status === 200) {
                Alert.alert("Success!", "Pantry ingredient edited successfully!")
                navigation.navigate('pantry1')
            }
        } catch (err) {
            console.error("Error editing pantry ingredient:", err);
            Alert.alert("Error!", "Could not edit the current pantry ingredient. Please try again.")
        }
    }
    return (
        <TouchableOpacity onPress={handleSuggest}>
            <View style={det.bluebutton}> 
                <Text style={styles.regularText}>
                    Update Ingredient
                </Text>
            </View>
        </TouchableOpacity>
        
    )
}

const EditPantryIngredient = ( { route } ) => {
    const { ingredient } = route.params;
    const [quantity, setQuantity] = useState(ingredient?.quantity || 1)

    const handleMinus = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }        
    }

    const handlePlus = () => {
        setQuantity(quantity + 1)
    }

  return (
    <View style={styles.whiteBackground}>
        <View style={styles.screenContainer}>
            <BackButton />
            <Text style={styles.title}>Edit Ingredient</Text>
            <View style={det.container}>

                {/* ingredient label and image */}
                <View style={det.rowLeft}>
                    <Image 
                        style={det.foodIcon}
                        source={{uri: ingredient?.image}}/>
                    <Text style={[styles.boldfont, {marginLeft: 10}]}>
                        {ingredient?.label}
                    </Text>
                </View>
                <Divider />

                {/* quantity section */}
                <Text style={[styles.heading, {marginVertical: 10}]}>Quantity</Text >
                <View style={det.rowMiddle}>
                    <MinusButton 
                        onPress={handleMinus}/>
                        <Text style={[styles.regularText, {fontSize: 24}, {marginHorizontal: 50}]}>
                            {quantity}
                        </Text>      
                    <AddButton 
                        onPress={handlePlus}/>
                </View>
                
                {/* final button */}
                <Divider />
                <AddIngredient ingredient={ingredient} quantity={quantity}/>

            </View>
            
        </View>
    </View>
  )
}

export default EditPantryIngredient

const det = StyleSheet.create({
    greybutton: {
        flexDirection: 'row',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: colors.othergrey,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        elevation: 2,
        shadowColor: colors.black,
    },
    bluebutton: {
        flexDirection: 'row',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        elevation: 2,
        shadowColor: colors.black,
        marginHorizontal: 70,
        marginTop: 25,
    },
    foodIcon: {
        width: 100,
        height: 100,
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.grey,
        marginRight: 12,
    },
    rowLeft: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 15,
    },
    rowMiddle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    container: {
        marginHorizontal: 15,
    },
    blueRoundButton: {
        borderRadius: 200,
        padding:5,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        elevation: 2,
        height: 40,
        width: 40,
    }
})