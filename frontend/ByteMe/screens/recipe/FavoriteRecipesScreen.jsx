import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

import Back_butt from '../../assets/images/backbutton.png';
import heartIcon from '../../assets/images/heart.png';
import emptyHeartIcon from '../../assets/images/empty-heart.png';
// import FavoriteRecipesScreen from '@/app/(recipe)/favoriterecipes';

const USER_ID = "67d3a9717c654c6be6f07502"; // Temporary test user ID

const RecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Extract parameters directly from route
  const {
    recipeId = '',
    title = '',
    directions = "No directions available.",
    imageUri = '',
    isSaved = false,  // Check if the recipe is saved (defaults to false)
  } = route.params || {};

  // Parse ingredients (handle string or array)
  const ingredients = typeof route.params['ingredients'] === 'string'
    ? route.params['ingredients'].split(',')
    : (route.params['ingredients'] || []); // Ensure it's an array, default to empty

  // Parse allergies (handle string or array)
  const allergies = typeof route.params['allergies'] === 'string'
    ? route.params['allergies'].split(',')
    : (route.params['allergies'] || []); // Ensure it's an array, default to empty

  let parsedNutrition = null; // Default value if parsing fails or data is missing
  const nutritionData = route.params?.nutrition; // Use optional chaining to safely access

  if (nutritionData) { // Check if nutritionData exists and is not null/undefined
    if (typeof nutritionData === 'string') {
      try {
        parsedNutrition = JSON.parse(nutritionData);
      } catch (e) {
        console.error("Failed to parse nutrition string:", e);
        // Keep parsedNutrition as null or set to an empty object {} if preferred
        parsedNutrition = {}; // Default to empty object on error
      }
    } else if (typeof nutritionData === 'object') {
      // It's already an object, use it directly
      parsedNutrition = nutritionData;
    } else {
       console.warn("Unexpected type for nutrition data:", typeof nutritionData);
       parsedNutrition = {}; // Default to empty object for unexpected types
    }
  } else {
     console.log("Nutrition data not provided in route params.");
     parsedNutrition = {}; // Default to empty object if not provided
  }
  // Use 'parsedNutrition' going forward
  const nutrition = parsedNutrition;

  // Basic validation check (optional, but good practice)
  if (!recipeId || !title ) { // Removed ingredients/directions check as they have defaults
    console.error("RecipeDetailsScreen: Missing essential parameters like recipeId or title.");
    // You might want to show a more user-friendly error message or navigate back
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Essential recipe details missing!</Text>
         <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text>Go Back</Text>
         </TouchableOpacity>
      </View>
    );
  }

  const [activeSection, setActiveSection] = useState(0);
  const [isSavedRecipe, setIsSavedRecipe] = useState(isSaved); // Initialize with route param

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  // Function to Save Recipe to Backend
  const saveRecipe = async () => {
    if (!recipeId) return;

    try {
      const response = await axios.post("http://localhost:5000/api/users/save-recipe", {
        userId: USER_ID, // Send only user ID
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
      // More specific error message if available from response
      const message = err.response?.data?.message || "Could not save recipe. Please try again.";
      Alert.alert("Error", message);
    }
  };

  // Function to Unsave Recipe from Backend
  const unsaveRecipe = async() => {
    if (!recipeId) return;

    try {
        const response = await axios.delete("http://localhost:5000/api/users/remove-recipe",{
        data: { // For DELETE requests with body, data often goes under 'data' key in Axios config
          userId: USER_ID,
          recipeId: recipeId
        }
      });

      if (response.status === 200){
        setIsSavedRecipe(false); // Update the saved state
        Alert.alert("Success", "Recipe unsaved successfully!"); // Corrected typo
      } else{
        throw new Error("Failed to unsave recipe."); // Corrected typo
      }
    } catch (err){
      console.error("Error removing recipe:", err); // Corrected console log message
      const message = err.response?.data?.message || "Could not remove recipe. Please try again.";
      Alert.alert("Error", message);
    }
  };

  // Function to render heart icon (save/unsave button)
  const renderSaveButton = () => {
    return (
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          isSavedRecipe ? unsaveRecipe() : saveRecipe();
        }}  // Toggle between save and unsave
      >
        <Image
          source={isSavedRecipe ? heartIcon : emptyHeartIcon}  // Toggle between filled and empty heart
          style={styles.heartIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          // Consider using navigation.goBack() for a more standard back behavior
          // onPress={() => navigation.goBack()}
          // Or if you specifically need to go to the savedrecipes tab:
          onPress={() => navigation.navigate('(tabs)', { screen: 'savedrecipes' })}
        >
          <Image source={Back_butt} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Recipe Image */}
      {imageUri ? (
        <View style={styles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        </View>
      ) : (
        // Provide a placeholder or adjust layout if no image
        <View style={[styles.recipeWrapper, styles.recipeImagePlaceholder]}>
             <Text>No image available</Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Save Button */}
      {renderSaveButton()}

      {/* Compact Section Tabs */}
      <View style={styles.tabContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeSection === index && styles.activeTab]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={[styles.tabText, activeSection === index && styles.activeTabText]}>
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContent}>
          {activeSection === 0 && (
            <>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.sectionText}>- {ingredient.trim()}</Text> // Added trim()
                  ))
              ) : (
                  <Text style={styles.sectionText}>No ingredients listed.</Text>
              )}
            </>
          )}

          {activeSection === 1 && (
            <>
              <Text style={styles.sectionTitle}>Allergy Information:</Text>
              {allergies.length > 0 ? (
                allergies.map((allergy, index) => (
                  <Text key={index} style={styles.sectionText}>- {allergy.trim()}</Text> // Added trim()
                ))
              ) : (
                <Text style={styles.sectionText}>No specific allergy information provided.</Text> // Improved message
              )}
            </>
          )}

          {activeSection === 2 && (
            <>
              <Text style={styles.sectionTitle}>Directions:</Text>
              {/* Check if directions is meaningful */}
              {directions && directions !== "No directions available." ? (
                 <Text style={styles.sectionText}>{directions}</Text>
              ) : (
                 <Text style={styles.sectionText}>No directions provided.</Text>
              )}
            </>
          )}

          {activeSection === 3 && (
            <>
              <Text style={styles.sectionTitle}>Nutrition Facts:</Text>
              {/* Check if nutrition exists and has keys */}
              {nutrition && Object.keys(nutrition).length > 0 ? (
                <>
                  {Object.keys(nutrition).map((key) => {
                    // Defensive check for properties inside nutrition[key]
                    const nutrient = nutrition[key];
                    if (nutrient && typeof nutrient === 'object' && nutrient.label) {
                        const { label, quantity, unit } = nutrient;
                        return (
                          <Text key={key} style={styles.sectionText}>
                            {label}: {Math.round(quantity || 0)} {unit || ''}
                          </Text>
                        );
                    }
                    return null; // Skip rendering if nutrient data is malformed
                  })}
                </>
              ) : (
                <Text style={styles.sectionText}>No nutrition data available.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Styles (keep your existing styles here)
const styles = StyleSheet.create({
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
    paddingHorizontal: 15, // Adjusted padding slightly
    borderRadius: 8,
    backgroundColor: '#d7e2f1',
    marginRight: 'auto', // Push other header items away if needed
  },
  backIcon: {
    width: 20, // Slightly smaller
    height: 20, // Slightly smaller
    marginRight: 5, // Reduced margin
  },
  backText: {
    fontSize: 15, // Slightly smaller
    fontWeight: '600', // Adjusted weight
    color: '#000',
  },
   errorText: { // Added style for errors
     fontSize: 16,
     color: 'red',
     textAlign: 'center',
     marginTop: 20,
   },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f508f',
    textAlign: 'center',
  },
  saveButton: {
    // backgroundColor: '#fff', // Can remove if only using icon
    padding: 5, // Make it just large enough for the icon
    borderRadius: 50, // Make it circular
    marginBottom: 15, // Increased margin
    alignSelf: 'center',
    // Removed border, rely on icon
  },
  heartIcon: {
    width: 32,
    height: 32,
  },
  recipeWrapper: {
    width: '100%',
    height: 220,
    borderWidth: 1, // Thinner border
    borderColor: '#ccc', // Lighter border
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0', // Background for placeholder
  },
  recipeImagePlaceholder: { // Style for placeholder view
      justifyContent: 'center',
      alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10, // Increased margin
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8, // Increased padding
  },
  tab: {
    flex: 1,
    paddingVertical: 8, // Increased padding
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTab: {
    borderBottomWidth: 3, // Thicker indicator
    borderBottomColor: '#1f508f',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#1f508f',
  },
  sectionContent: {
    paddingHorizontal: 5, // Reduced horizontal padding slightly
    marginTop: 10,
    paddingBottom: 30, // Add padding at the bottom of scroll content
  },
  sectionTitle: {
    fontSize: 18, // Larger title
    fontWeight: 'bold',
    marginBottom: 8, // Increased margin
    color: '#333', // Darker color
  },
  sectionText: {
    fontSize: 15, // Slightly larger text
    color: '#444', // Slightly darker
    marginVertical: 4, // Increased vertical margin
    lineHeight: 21, // Improve readability
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default RecipeDetailsScreen;