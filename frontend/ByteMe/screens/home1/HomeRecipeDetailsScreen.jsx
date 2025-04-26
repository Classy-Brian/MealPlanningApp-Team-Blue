import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import backarrow from '@/assets/images/back_arrow_navigate.png';

const HomeRecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    recipeLabel = '',
    imageUri = '',
    ingredients = '[]',
    allergies = '[]',
    directions = 'No directions available.',
    nutrition = '{}',
  } = route.params || {};

  const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
  const parsedAllergies = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
  const parsedNutrition = typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition;

  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];
  const [activeSection, setActiveSection] = useState(0);

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={backarrow} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* 📸 Image */}
      {imageUri ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      ) : (
        <Text style={styles.errorText}>No image available</Text>
      )}

      {/* 📝 Title */}
      <Text style={styles.title}>{recipeLabel}</Text>

      {/* 🧩 Tabs */}
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

      {/* 📖 Section Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          {activeSection === 0 && (
            <>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              {parsedIngredients.length > 0 ? (
                parsedIngredients.map((item, idx) => (
                  <Text key={idx} style={styles.sectionText}>- {item}</Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No ingredients available.</Text>
              )}
            </>
          )}

          {activeSection === 1 && (
            <>
              <Text style={styles.sectionTitle}>Allergies:</Text>
              {parsedAllergies.length > 0 ? (
                parsedAllergies.map((item, idx) => (
                  <Text key={idx} style={styles.sectionText}>- {item}</Text>
                ))
              ) : (
                <Text style={styles.sectionText}>No allergies listed.</Text>
              )}
            </>
          )}

          {activeSection === 2 && (
            <>
              <Text style={styles.sectionTitle}>Directions:</Text>
              <Text style={styles.sectionText}>
                {directions || 'No directions available.'}
              </Text>
            </>
          )}

          {activeSection === 3 && (
            <>
              <Text style={styles.sectionTitle}>Nutrition Facts:</Text>
              {parsedNutrition && Object.keys(parsedNutrition).length > 0 ? (
                Object.keys(parsedNutrition).map((key) => {
                  const { label, quantity, unit } = parsedNutrition[key];
                  return (
                    <Text key={key} style={styles.sectionText}>
                      {label}: {Math.round(quantity || 0)} {unit}
                    </Text>
                  );
                })
              ) : (
                <Text style={styles.sectionText}>No nutrition data.</Text>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backIcon: { width: 24, height: 24, marginRight: 8 },
  backText: { fontSize: 16, fontWeight: 'bold', color: '#1F508F' },
  imageWrapper: {
    width: '100%', height: 220,
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, overflow: 'hidden',
    marginBottom: 15,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  errorText: { textAlign: 'center', color: 'gray', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F508F', textAlign: 'center', marginBottom: 10 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1, borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  tab: { paddingVertical: 8 },
  tabText: { fontSize: 14, color: '#666' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#1F508F' },
  activeTabText: { fontWeight: 'bold', color: '#1F508F' },
  contentContainer: { paddingBottom: 20 },
  section: { paddingHorizontal: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  sectionText: { fontSize: 14, color: '#333', marginVertical: 2 },
});

export default HomeRecipeDetailsScreen;
