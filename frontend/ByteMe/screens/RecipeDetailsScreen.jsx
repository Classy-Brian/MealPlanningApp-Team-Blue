import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Back_butt from '@/assets/images/backbutton.png';

const RecipeDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { recipeId, title, ingredients, directions, imageUri } = route.params || {};

  if (!recipeId || !title || !ingredients || !directions) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Recipe details not passed correctly!</Text>
      </View>
    );
  }

  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { title: 'Ingredients' },
    { title: 'Allergies' },
    { title: 'Directions' },
    { title: 'Nutrition Facts' },
  ];

  const handleSaveRecipe = () => {
    // Save the recipe logic here (e.g., saving to local storage, context, or state)
    const savedRecipe = { recipeId, title, ingredients, directions, imageUri };

    // Navigate to SavedRecipesScreen after saving
    navigation.navigate('SavedRecipeScreen', { savedRecipe });
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('RecipeList')}>
          <Image source={Back_butt} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Recipe Image without Overlay */}
      {imageUri && (
        <View style={styles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveRecipe}>
        <Text style={styles.saveButtonText}>Add Recipe</Text>
      </TouchableOpacity>

      {/* Sections (Tabs) Row - Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionContainer}>
        {sections.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.sectionButton, index === activeSection && styles.activeSection]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {index === activeSection && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Space below the sections */}
      <View style={styles.contentWrapper}>
        {/* Display content based on active section */}
        <ScrollView style={styles.sectionContentWrapper}>
          {activeSection === 0 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Ingredients:</Text>
              {ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.sectionContentText}>
                  - {ingredient}
                </Text>
              ))}
            </View>
          )}
          {activeSection === 1 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Allergies content coming soon!</Text>
            </View>
          )}
          {activeSection === 2 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Directions:</Text>
              <Text style={styles.sectionContentText}>{directions}</Text>
            </View>
          )}
          {activeSection === 3 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Nutrition facts coming soon!</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Add padding to make it look more like the save button
    paddingHorizontal: 30, // Make it consistent with the save button width
    borderRadius: 10, // Round the corners
    backgroundColor: '#d7e2f1', // Add background color to match the save button
    marginBottom: 10, // Add space at the bottom for consistency
    alignSelf: 'center', // Center the button
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000', // Keep the text color dark for visibility
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f508f',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#adc6f2',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  recipeWrapper: {
    width: '100%',
    height: 250, // Set this to your desired image height or adjust accordingly
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover', // Ensures image covers the entire container
  },
  sectionContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionButton: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000',
  },
  activeSection: {
    fontWeight: 'bold',
  },
  activeLine: {
    marginTop: 5,
    height: 3,
    width: 60,
    backgroundColor: '#000000',
  },
  contentWrapper: {
    marginTop: 20,
  },
  sectionContentWrapper: {
    flex: 1,
    paddingBottom: 170, // Space at the bottom for scroll
  },
  sectionContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionContentText: {
    fontSize: 19,
    color: '#000',
    marginVertical: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RecipeDetailsScreen;
