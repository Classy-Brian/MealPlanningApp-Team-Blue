import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeRecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    recipeLabel = '',
    time = '',
    imageUri = '',
    ingredients,
    allergies,
    directions = '',
    nutrition,
  } = route.params || {};
  

  // ✅ Robust safe parsing
  const safeParse = (value, fallback) => {
    try {
      if (typeof value === 'string') return JSON.parse(value);
      if (Array.isArray(value) || typeof value === 'object') return value;
      return fallback;
    } catch {
      return fallback;
    }
  };

  const parsedIngredients = safeParse(ingredients, []);
  const parsedAllergies = safeParse(allergies, []);
  const parsedNutrition = safeParse(nutrition, {});

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  return (
    // <SafeAreaView>
        <ScrollView style={styles.container}>
        {/* 🔙 Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F508F" />
          <Text style={styles.backButtonText}>Recipes</Text>
        </TouchableOpacity>

        {/* 📸 Recipe Image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.recipeImage} />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Text style={{ color: '#777' }}>No Image Available</Text>
          </View>
        )}

        {/* 🥘 Title */}
        <Text style={styles.title}>{recipeLabel}</Text>

        {/* ⏰ Time */}
        {time ? (
          <View style={styles.timeWrapper}>
            <Text style={styles.timeText}>Scheduled at {time}</Text>
          </View>
        ) : null}

        {/* 🗂️ Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.tab, activeTab === i && styles.activeTab]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[styles.tabText, activeTab === i && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 📃 Content */}
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
              <Text style={styles.sectionTitle}>Directions:</Text>
              <Text style={styles.sectionItem}>{directions || 'No directions available.'}</Text>
            </>
          )}

          {activeTab === 3 && (
            <>
              <Text style={styles.sectionTitle}>Nutrition:</Text>
              {Object.keys(parsedNutrition).length > 0 ? (
                Object.values(parsedNutrition).map((item, i) => (
                  <Text key={i} style={styles.sectionItem}>
                    {item.label}: {Math.round(item.quantity || 0)} {item.unit}
                  </Text>
                ))
              ) : (
                <Text style={styles.sectionItem}>No nutrition data available.</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    // </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d7e2f1',
    padding: 8,
    borderRadius: 10,
    marginBottom: 15,
  },
  backButtonText: { marginLeft: 8, color: '#000', fontWeight: 'bold' },
  recipeImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  recipeImagePlaceholder: {
    width: '100%', height: 200, borderRadius: 10, marginBottom: 10,
    backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center'
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#1F508F', marginBottom: 4 },
  timeWrapper: { alignItems: 'center', marginBottom: 12 },
  timeText: { color: '#555', fontSize: 14 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
  tab: { paddingVertical: 6 },
  tabText: { fontSize: 15, color: '#555' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#1F508F' },
  activeTabText: { color: '#1F508F', fontWeight: 'bold' },
  content: { paddingTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  sectionItem: { fontSize: 14, color: '#333', marginBottom: 6 },
});

export default HomeRecipeDetailsScreen;
