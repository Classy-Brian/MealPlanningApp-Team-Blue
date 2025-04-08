import { Image, StyleSheet, Text, View, Button, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'
import { styles } from '@/components/Sheet'
import { RadioButton } from 'react-native-paper'
import { useRouter } from 'expo-router'

const backArrowImage = require('../../assets/images/back_arrow_navigate.png');
const nextArrowImage = require('../../assets/images/next_arrow_navigate.png');
const nextButtonImage = require('../../assets/images/next_arrow.png');
const feeds1Icon = require('../../assets/images/feeds1_icon.png')
const feeds2Icon = require('../../assets/images/feeds2_icon.png')
const feeds4Icon = require('../../assets/images/feeds4_icon.png')

function NextButton() {
  return (
    <View >
      <Image source={nextButtonImage}/>
    </View>
  )
}

const PORTION_OPTIONS = [
    { value: 1, label: 'Feeds 1', description: 'Individual', icon: feeds1Icon },
    { value: 2, label: 'Feeds 2', description: 'Couple', icon: feeds2Icon },
    { value: 4, label: 'Feeds 4', description: 'Family', icon: feeds4Icon },
]

const SurveyPortion = ({ navigation }) => {
    const window = Dimensions.get('window')

    const [portion, setSelectedPortion] = useState(null);

    const handleSelection = (value) => {
        setSelectedPortion(value);
    };

    useEffect(() => {
        const loadPortionSize = async () => {
            try {
                const savedPortion = await AsyncStorage.getItem('portion');
                if (savedPortion !== null) {
                    const parsedValue = parseInt(savedPortion, 10);
                    if (PORTION_OPTIONS.some(option => option.value === parsedValue)) {
                        setSelectedPortion(parsedValue);
                    } else {
                        console.warn("Loaded invalid portion size from storage:", savedPortion);
                    }
                }
            } catch (e) {
                console.error("Failed to load portion size from storage", e);
            }
        };
        loadPortionSize();
    }, []);

    const nextPage = async () => {
        await AsyncStorage.setItem('portion', JSON.stringify(portion));
        navigation.navigate('survey4', { portion });
    };
    
    const prevPage = async () => {
        await AsyncStorage.setItem('portion', JSON.stringify(portion));
        navigation.navigate('survey2', { portion });
    }

    return (
        <View style={styles.whiteBackground}>
            <View style={styles.screenContainer}>
                
                {/* Header buttons */}
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={prevPage}>
                        <View style={styles_portion.greybutton}>
                            <Image style={{marginRight:10}} source={backArrowImage}/>
                            <Text style={styles.regularText}>Allergies</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextPage}>
                        <View style={[styles_portion.greybutton, {justifyContent: 'space-between'}]}>
                            <Text style={[styles.regularText, {marginRight:10}]}>Skip</Text>
                            <Image source={nextArrowImage}/>            
                        </View>
                    </TouchableOpacity>          
                </View>

                <Text style={[styles.title, {marginTop: 10}]}>Portion Size </Text>
                <Text style={[styles.regularText, {marginBottom: 20, color: textcolors.darkgrey}]}>
                    Select your preferred portion size.
                </Text>

                {/* Radio Button Options */}
                <View style={styles_portion.optionsContainer}>
                    <RadioButton.Group onValueChange={newValue => handleSelection(parseInt(newValue, 10))} value={portion?.toString()}>
                        {PORTION_OPTIONS.map((option) => (
                            <TouchableOpacity key={option.value} onPress={() => handleSelection(option.value)} style={styles_portion.optionRow}>
                                <RadioButton.Android 
                                    value={option.value.toString()} 
                                    status={portion === option.value ? 'checked' : 'unchecked'}
                                    color={colors.header}
                                />
                                <Text style={styles_portion.optionLabel}>{option.label}</Text>
                                <Image source={option.icon} style={styles_portion.optionIcon} />
                            </TouchableOpacity>
                        ))}
                    </RadioButton.Group>
                </View>

            </View>

            <TouchableOpacity onPress={nextPage}>
                <View style={[styles_portion.nextbutton, {right: 0, top: 0, transform:[{translateX: 30}, {translateY: 265}]}]}>
                    <NextButton />
                </View>
            </TouchableOpacity>

        </View>
    );

};

const styles_portion = StyleSheet.create({
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
    optionsContainer: {
        marginTop: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightgrey,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    optionLabel: {
        fontSize: 18,
        marginLeft: 10,
        flex: 1,
    },
    optionIcon: {
        width: 30,
        height: 30,
        marginLeft: 10,
        resizeMode: 'contain',
    },
    nextButtonContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        transform:[{translateX: 30}, {translateY: 130}]
    },
    nextbutton: {
        borderRadius: 100,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#91A9C8',
        height: 170,
        width: 170,
        position: 'absolute',
        elevation: 2,
        shadowColor: colors.black,
    },
});

export default SurveyPortion