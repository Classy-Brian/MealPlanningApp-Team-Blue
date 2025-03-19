import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Back_butt from '@/assets/images/backbutton.png';
import ExploreRecipesScreen from '@/app/explorerecipes';

const USER_ID = "67c8da45f97986963147083a"; // Temporary test user ID

const RecipeDetailsScreen = ({}) => {
  const route = useRoute();
  const navigation = useNavigation();

  console.log("Route Params:", route.params);  // Debugging log

  // ✅ Extract parameters directly without parsing
  const {
    recipeId = '',
    title = '',
    ingredients = [],  // ✅ Directly use the array from route params
    directions = "No directions available.",
    imageUri = '',
    allergies = [], // ✅ Directly use the array
    nutrition = {}, // ✅ Directly use the object
  } = route.params || {};

  if (!recipeId || !title || ingredients.length === 0 || !directions) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Recipe details not passed correctly!</Text>
      </View>
    );
  }

  const [activeSection, setActiveSection] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  // ✅ Function to Save Recipe to Backend
  const saveRecipe = async () => {
    if (!recipeId) return;

    try {
      const response = await axios.post("http://localhost:5000/api/users/save-recipe", {
        userId: USER_ID, // Send only user ID
        recipeId: recipeId, // Send only recipe ID
      });

      if (response.status === 200) {
        setIsSaved(true);
        Alert.alert("Success", "Recipe saved successfully!");
      } else {
        throw new Error("Failed to save recipe.");
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      Alert.alert("Error", "Could not save recipe. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('explorerecipes')}>
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
        <Text style={styles.errorText}>No image available</Text>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveRecipe} disabled={isSaved}>
        <Text style={styles.saveButtonText}>{isSaved ? "Recipe Saved" : "Add Recipe"}</Text>
      </TouchableOpacity>

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
              {ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.sectionText}>- {ingredient}</Text>
              ))}
            </>
          )}

          {activeSection === 1 && (
            <>
              <Text style={styles.sectionTitle}>Allergy Information:</Text>
              {allergies.length > 0 ? (
                allergies.map((allergy, index) => (
                  <Text key={index} style={styles.sectionText}>- {allergy}</Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No allergy information available.</Text>
              )}
            </>
          )}

          {activeSection === 2 && (
            <>
              <Text style={styles.sectionTitle}>Directions:</Text>
              <Text style={styles.sectionText}>{directions}</Text>
            </>
          )}

          {activeSection === 3 && (
            <>
              <Text style={styles.sectionTitle}>Nutrition Facts:</Text>
              {nutrition ? (
                <>
                  <Text style={styles.sectionText}>Calories: {Math.round(nutrition.ENERC_KCAL?.quantity || 0)} kcal</Text>
                  <Text style={styles.sectionText}>Protein: {Math.round(nutrition.PROCNT?.quantity || 0)}g</Text>
                  <Text style={styles.sectionText}>Fat: {Math.round(nutrition.FAT?.quantity || 0)}g</Text>
                  <Text style={styles.sectionText}>Carbs: {Math.round(nutrition.CHOCDF?.quantity || 0)}g</Text>
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

// Styles
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
  saveButtonText: {
    color: '#000',
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
});

export default RecipeDetailsScreen;
