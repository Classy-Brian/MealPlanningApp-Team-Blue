import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import Back_butt from '@/assets/images/backbutton.png';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import { colors } from '@/components/Colors';
import { styles } from '@/components/Sheet';
import { usePantry } from '@/components/PantryContext';

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>HomePage</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const PantrySuggestionDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { removeSuggestion } = usePantry();

  const [userId, setUserId] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isSavedRecipe, setIsSavedRecipe] = useState(false);

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition']; // ✅ Now declared

  const {
    recipeId = '',
    title = '',
    directions = 'No directions available.',
    imageUri = '',
  } = route.params || {};

  const ingredients = typeof route.params.ingredients === 'string'
    ? JSON.parse(route.params.ingredients)
    : route.params.ingredients || [];

  const allergies = typeof route.params.allergies === 'string'
    ? JSON.parse(route.params.allergies)
    : route.params.allergies || [];

  const nutrition = typeof route.params.nutrition === 'string'
    ? JSON.parse(route.params.nutrition)
    : route.params.nutrition || {};

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      if (!id) console.warn("User ID not found");
      setUserId(id);
    };
    fetchUserId();
  }, []);

    const saveRecipe = async () => {
        if (!recipeId || !userId) return;
        try {
            const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`, {
                userId,
                recipeId
            });
            if (response.status === 200) {
                setIsSavedRecipe(true);
                Alert.alert("Success", "Recipe saved successfully!");

                removeSuggestion(recipeId);

                navigation.goBack();
            } else {
                throw new Error("Failed to save recipe.");
            }
        } catch (err) {
            console.error("Error saving recipe:", err);
            Alert.alert("Error", "Could not save recipe. Please try again.");
        }
    };

    const renderSaveButton = () => (
        <TouchableOpacity
            style={det.saveButton}
            onPress={saveRecipe}
            disabled={isSavedRecipe}
        >
            <Text style={det.saveButtonText}>{isSavedRecipe ? "Recipe Saved" : "Add Recipe"}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={det.container}>
            <View style={det.header}>
                <BackButton />
            </View>

            {imageUri ? (
                <View style={det.recipeWrapper}>
                    <Image source={{ uri: imageUri }} style={det.recipeImage} />
                </View>
            ) : (
                <Text style={det.errorText}>No image available</Text>
            )}

            <Text style={det.title}>{title}</Text>
            {!isSavedRecipe && renderSaveButton()}

            <View style={det.tabContainer}>
                {sections.map((section, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[det.tab, activeSection === index && det.activeTab]}
                        onPress={() => setActiveSection(index)}
                    >
                        <Text style={[det.tabText, activeSection === index && det.activeTabText]}>{section}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={det.scrollContent}>
                <View style={det.sectionContent}>
                    {activeSection === 0 && (
                        <>
                            <Text style={det.sectionTitle}>Ingredients:</Text>
                            {ingredients.map((ingredient, i) => (
                                <Text key={i} style={det.sectionText}>- {ingredient}</Text>
                            ))}
                        </>
                    )}
                    {activeSection === 1 && (
                        <>
                            <Text style={det.sectionTitle}>Allergy Information:</Text>
                            {allergies.length ? allergies.map((a, i) => (
                                <Text key={i} style={det.sectionText}>- {a}</Text>
                            )) : <Text style={det.sectionText}>No allergy information available.</Text>}
                        </>
                    )}
                    {activeSection === 2 && (
                        <>
                            <Text style={det.sectionTitle}>Directions:</Text>
                            <Text style={det.sectionText}>{directions}</Text>
                        </>
                    )}
                    {activeSection === 3 && (
                        <>
                            <Text style={det.sectionTitle}>Nutrition Facts:</Text>
                            {nutrition ? (
                                Object.keys(nutrition).map((key) => {
                                    const { label, quantity, unit } = nutrition[key];
                                    return (
                                        <Text key={key} style={det.sectionText}>
                                            {label}: {Math.round(quantity || 0)} {unit}
                                        </Text>
                                    );
                                })
                            ) : (
                                <Text style={det.sectionText}>No nutrition data available.</Text>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

// StyleSheet
const det = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#d7e2f1',
    },
    backIcon: {
      width: 22,
      height: 22,
      marginRight: 8,
    },
    backText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#000',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#1f508f',
      textAlign: 'center',
    },
    saveButton: {
      backgroundColor: '#adc6f2',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 10,
      alignSelf: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: '#000',
      //fontWeight: 'bold',
      fontSize: 16,
      fontWeight: '700',
    },
    recipeWrapper: {
      width: '100%',
      height: 220,
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 8,
      overflow: 'hidden',
      alignSelf: 'center',
      marginBottom: 15,
    },
    recipeImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      resizeMode: 'cover',
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 5,
    },
    tab: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
    },
    tabText: {
      fontSize: 14,
      color: '#555',
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#1f508f',
    },
    activeTabText: {
      fontWeight: 'bold',
      color: '#1f508f',
    },
    sectionContent: {
      paddingHorizontal: 10,
      marginTop: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    sectionText: {
      fontSize: 14,
      color: '#333',
      marginVertical: 2,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-start',  // Ensures content starts at the top
    },
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
  });

export default PantrySuggestionDetailsScreen;
