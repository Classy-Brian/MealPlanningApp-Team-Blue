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

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition Facts'];

  const handleSaveRecipe = () => {
    const savedRecipe = { recipeId, title, ingredients, directions, imageUri };
    navigation.navigate('savedrecipes', { savedRecipe });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('RecipeList')}>
          <Image source={Back_butt} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveRecipe}>
        <Text style={styles.saveButtonText}>Add Recipe</Text>
      </TouchableOpacity>

      {/* Horizontal Scroll for Section Titles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.sectionButton, index === activeSection && styles.activeSection]}
            onPress={() => setActiveSection(index)}
          >
            <Text style={styles.sectionTitle}>{section}</Text>
            {index === activeSection && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Display content for the active section */}
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.sectionContentWrapper}>
          {activeSection === 0 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Ingredients:</Text>
              {ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.sectionContentText}>- {ingredient}</Text>
              ))}
            </View>
          )}

          {activeSection === 1 && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionContentText}>Allergy information coming soon!</Text>
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
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#d7e2f1',
    marginBottom: 10,
    alignSelf: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
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
    height: 250,
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
    resizeMode: 'cover',
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
    paddingBottom: 170,
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
