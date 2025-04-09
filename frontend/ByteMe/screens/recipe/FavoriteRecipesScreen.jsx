import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Back_butt from '@/assets/images/backbutton.png';
import heartIcon from '@/assets/images/heart.png';
import emptyHeartIcon from '@/assets/images/empty-heart.png';
import getUserIdFromToken from '@/components/getUserIdFromToken';

const RecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      if (!id) console.warn("User ID not found");
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const {
    recipeId = '',
    title = '',
    directions = 'No directions available.',
    imageUri = '',
  } = route.params || {};

  const ingredients = typeof route.params['ingredients'] === 'string'
    ? route.params['ingredients'].split(',')
    : route.params['ingredients'];

  const allergies = typeof route.params['allergies'] === 'string'
    ? route.params['allergies'].split(',')
    : route.params['allergies'];

  const nutrition = JSON.parse(typeof route.params.nutrition === 'string'
    ? route.params.nutrition
    : JSON.stringify(route.params.nutrition));

  const [activeSection, setActiveSection] = useState(0);
  const [isSavedRecipe, setIsSavedRecipe] = useState(true);
  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  const saveRecipe = async () => {
    if (!recipeId || !userId) return;

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`, {
        userId,
        recipeId,
      });

      if (response.status === 200) {
        setIsSavedRecipe(true);
        Alert.alert("Success", "Recipe saved successfully!");
      } else {
        throw new Error("Failed to save recipe.");
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      Alert.alert("Error", "Could not save recipe. Please try again.");
    }
  };

  const unsaveRecipe = async () => {
    if (!recipeId || !userId) return;

    try {
      const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/remove/remove-recipe`, {
        data: { userId, recipeId },
      });

      if (response.status === 200) {
        setIsSavedRecipe(false);
        Alert.alert("Success", "Recipe unsaved successfully!");
      } else {
        throw new Error("Failed to unsave recipe.");
      }
    } catch (err) {
      console.error("Error removing recipe:", err);
      Alert.alert("Error", "Could not remove recipe. Please try again.");
    }
  };

  const renderSaveButton = () => (
    <TouchableOpacity
      style={styles.saveButton}
      onPress={isSavedRecipe ? unsaveRecipe : saveRecipe}
    >
      <Image
        source={isSavedRecipe ? heartIcon : emptyHeartIcon}
        style={styles.heartIcon}
      />
    </TouchableOpacity>
  );

  if (!recipeId || !title || ingredients.length === 0 || !directions) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Recipe details not passed correctly!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.push('(tabs)', { screen: 'savedrecipes' })}
        >
          <Image source={Back_butt} style={styles.backIcon} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {imageUri ? (
        <View style={styles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        </View>
      ) : (
        <Text style={styles.errorText}>No image available</Text>
      )}

      <Text style={styles.title}>{title}</Text>
      {renderSaveButton()}

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
                Object.keys(nutrition).map((key) => {
                  const { label, quantity, unit } = nutrition[key] || {};
                  return (
                    <Text key={key} style={styles.sectionText}>
                      {label}: {Math.round(quantity || 0)} {unit}
                    </Text>
                  );
                })
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#d7e2f1',
  },
  backIcon: { width: 22, height: 22, marginRight: 8 },
  backText: { fontSize: 16, fontWeight: '700', color: '#000' },
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
  heartIcon: { width: 32, height: 32 },
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
  tabText: { fontSize: 14, color: '#555' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#1f508f' },
  activeTabText: { fontWeight: 'bold', color: '#1f508f' },
  sectionContent: { paddingHorizontal: 10, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  sectionText: { fontSize: 14, color: '#333', marginVertical: 2 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start' },
  errorText: { fontSize: 16, textAlign: 'center', color: 'red', marginTop: 20 },
});

export default RecipeDetailsScreen;