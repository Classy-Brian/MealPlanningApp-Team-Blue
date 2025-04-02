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

function BackButton() {
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => route.replace('/(tabs)/pantry')}>
                <View style={[det.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Pantry</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const EditPantryIngredient = () => {
  return (
    <View style={styles.whiteBackground}>
        <View style={styles.screenContainer}>
            <BackButton />
            <Text style={styles.title}>Edit Ingredient</Text>
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
})