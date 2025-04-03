import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Back_butt from '../assets/images/backbutton.png';  // Adjusted path for back button
import heartIcon from '../assets/images/heart.png';  // Add filled heart image
import emptyHeartIcon from '../assets/images/empty-heart.png';  // Add empty heart image
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { colors } from '@/components/Colors';

// const USER_ID = "67d3a9717c654c6be6f07502"; // Temporary test user ID
const PORT = process.env.PORT;

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('savedrecipes')}>
                <View style={[det.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Recipes</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const RecipeDetailsScreen = () => {
  const route = useRoute();

  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      if (!id) {
        console.warn("User ID not found")
      }
      setUserId(id);
    }
    fetchUserId()
  }, [])

  // Extract parameters directly from route
  const {
    recipeId = '',
    title = '',
    directions = "No directions available.",
    imageUri = '',
    isSaved = false,  // Check if the recipe is saved
  } = route.params || {};

    const ingredients = typeof route.params['ingredients'] === 'string' 
    ? route.params['ingredients'].split(',') 
    : route.params['ingredients'];
    
  
    const allergies = typeof route.params['allergies'] === 'string' 
    ? route.params['allergies'].split(',') 
    : route.params['allergies'];
  
    const nutrition = JSON.parse(typeof route.params.nutrition === "string" ? route.params.nutrition : JSON.stringify(route.params.nutrition));
  
    if (!recipeId || !title || ingredients.length === 0 || !directions) {
      return (
        <View style={det.container}>
          <Text style={det.errorText}>Error: Recipe details not passed correctly!</Text>
        </View>
      );
    }

  const [activeSection, setActiveSection] = useState(0);
  const [isSavedRecipe, setIsSavedRecipe] = useState(true);  // Initialize with route param

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  // Function to Save Recipe to Backend
  const saveRecipe = async () => {
    if (!recipeId) return;

    try {
      const response = await axios.post(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/save-recipe`, {
        userId: userId, // Send only user ID
        recipeId: recipeId, // Send only recipe ID
      });

      if (response.status === 200) {
        setIsSavedRecipe(true); // Update the saved state
        Alert.alert("Success", "Recipe saved successfully!");

      } else {
        throw new Error("Failed to save recipe.");
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      Alert.alert("Error", "Could not save recipe. Please try again.");
    }
  };

  const unsaveRecipe = async() => {
    if (!recipeId) return;

    try {
      const response = await axios.delete(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/remove/remove-recipe`, {
        data: {
        userId: userId, // Send only user ID
        recipeId: recipeId, // Send only recipe ID
        }
      });


      if (response.status == 200){
        setIsSavedRecipe(false);
        Alert.alert("success", "Recipe unsave successfully!");
      }
       else{
        throw new Error("Faield to unsave recipe.");
      }
    } catch (err){
      console.log("Error remove recipe:", err);
      Alert.alert("Error", "Could not remove recipe, please try again.");
    }
  }

// Function to render heart icon (save/unsave button)
const renderSaveButton = () => {
  return (
    <TouchableOpacity
      style={det.saveButton}
      onPress={() => {
        isSavedRecipe ? unsaveRecipe() : saveRecipe();
      }}  // Toggle between save and unsave
    >
      <Image
        source={isSavedRecipe ? heartIcon : emptyHeartIcon}  // Toggle between filled and empty heart
        style={det.heartIcon}
      />
    </TouchableOpacity>
  );
};


  return (
    <View style={det.container}>
      {/* Header with Back Button */}
      <View style={det.header}>
        <BackButton />
      </View>

      {/* Recipe Image */}
      {imageUri ? (
        <View style={det.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={det.recipeImage} />
        </View>
      ) : (
        <Text style={det.errorText}>No image available</Text>
      )}

      {/* Title */}
      <Text style={det.title}>{title}</Text>

      {/* Save Button - Only show if not already saved */}
      {renderSaveButton()}

      {/* Compact Section Tabs */}
      <View style={det.tabContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[det.tab, activeSection === index && det.activeTab]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[det.tabText, activeSection === index && det.activeTabText]}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Content */}
      <ScrollView contentContainerStyle={det.scrollContent}>
        <View style={det.sectionContent}>
          {activeSection === 0 && (
            <>
              <Text style={det.sectionTitle}>Ingredients:</Text>
              {ingredients.map((ingredient, index) => (
                <Text key={index} style={det.sectionText}>- {ingredient}</Text>
              ))}
            </>
          )}

          {activeSection === 1 && (
            <>
              <Text style={det.sectionTitle}>Allergy Information:</Text>
              {allergies.length > 0 ? (
                allergies.map((allergy, index) => (
                  <Text key={index} style={det.sectionText}>- {allergy}</Text>
                ))
              ) : (
                <Text style={det.sectionText}>No allergy information available.</Text>
              )}
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
                <>
                  {Object.keys(nutrition).map((key) => {
                    const { label, quantity, unit } = nutrition[key];
                    return (
                      <Text key={key} style={det.sectionText}>
                        {label}: {Math.round(quantity || 0)} {unit}
                      </Text>
                    );
                  })}
                </>
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

// det
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
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'center',
    borderColor: '#1f508f',
    borderWidth: 1,
  },
  heartIcon: {
    width: 32,
    height: 32,
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

export default RecipeDetailsScreen;