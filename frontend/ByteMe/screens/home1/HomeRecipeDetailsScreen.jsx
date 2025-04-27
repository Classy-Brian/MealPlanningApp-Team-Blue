// HomeRecipeDetailsScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';

const HomeRecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    recipeLabel,
    time,
    recipeId,
    imageUri,
    ingredients,
    allergies,
    nutrition,
  } = route.params || {};

  const parsedIngredients = JSON.parse(ingredients || '[]');
  const parsedAllergies = JSON.parse(allergies || '[]');
  const parsedNutrition = JSON.parse(nutrition || '{}');

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Ingredients', 'Allergies', 'Nutrition'];

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1F508F" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* 📸 Image */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.recipeImage} />
      ) : (
        <View style={styles.recipeImagePlaceholder}>
          <Text style={{ color: '#777' }}>No Image Available</Text>
        </View>
      )}

      {/* 🥘 Title */}
      <Text style={styles.title}>{recipeLabel}</Text>
      <Text style={styles.timeText}>Scheduled at {time}</Text>

      {/* 🗂️ Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📃 Section Content */}
      <View style={styles.content}>
        {activeTab === 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {parsedIngredients.length > 0 ? (
              parsedIngredients.map((item, i) => (
                <Text key={i} style={styles.sectionItem}>- {item}</Text>
              ))
            ) : (
              <Text style={styles.sectionItem}>No ingredients available.</Text>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <Text style={styles.sectionTitle}>Allergies:</Text>
            {parsedAllergies.length > 0 ? (
              parsedAllergies.map((item, i) => (
                <Text key={i} style={styles.sectionItem}>- {item}</Text>
              ))
            ) : (
              <Text style={styles.sectionItem}>No allergy info available.</Text>
            )}
          </>
        )}

        {activeTab === 2 && (
          <>
            <Text style={styles.sectionTitle}>Nutrition:</Text>
            {Object.keys(parsedNutrition).length > 0 ? (
              Object.values(parsedNutrition).map((nutrient, i) => (
                <Text key={i} style={styles.sectionItem}>
                  {nutrient.label}: {Math.round(nutrient.quantity || 0)} {nutrient.unit}
                </Text>
              ))
            ) : (
              <Text style={styles.sectionItem}>No nutrition data available.</Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButtonText: { color: '#1F508F', fontWeight: 'bold', marginLeft: 5 },
  recipeImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  recipeImagePlaceholder: {
    width: '100%', height: 200, borderRadius: 10, marginBottom: 10,
    backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F508F', textAlign: 'center', marginBottom: 5 },
  timeText: { textAlign: 'center', color: '#555', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tab: { paddingVertical: 6, paddingHorizontal: 10 },
  tabText: { fontSize: 16, color: '#555' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#1F508F' },
  activeTabText: { color: '#1F508F', fontWeight: 'bold' },
  content: { paddingHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F508F', marginBottom: 10 },
  sectionItem: { fontSize: 15, color: '#555', marginBottom: 6 },
});

export default HomeRecipeDetailsScreen;
