import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';

const HomeRecipeDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { recipeLabel, recipeId, time, imageUri, ingredients, allergies, nutrition } = route.params || {};

  const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];
  const parsedAllergies = allergies ? JSON.parse(allergies) : [];
  const parsedNutrition = nutrition ? JSON.parse(nutrition) : {};

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1F508F" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Image */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: '#777' }}>No image available</Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{recipeLabel}</Text>

      {/* Time */}
      <Text style={styles.timeText}>Scheduled Time: {time}</Text>

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {parsedIngredients.length > 0 ? (
        parsedIngredients.map((item, index) => (
          <Text key={index} style={styles.itemText}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.itemText}>No ingredients available</Text>
      )}

      {/* Allergies */}
      <Text style={styles.sectionTitle}>Allergy Info</Text>
      {parsedAllergies.length > 0 ? (
        parsedAllergies.map((item, index) => (
          <Text key={index} style={styles.itemText}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.itemText}>No allergy info available</Text>
      )}

      {/* Nutrition */}
      <Text style={styles.sectionTitle}>Nutrition</Text>
      {parsedNutrition && Object.keys(parsedNutrition).length > 0 ? (
        Object.keys(parsedNutrition).map((key) => {
          const { label, quantity, unit } = parsedNutrition[key];
          return (
            <Text key={key} style={styles.itemText}>
              {label}: {Math.round(quantity)} {unit}
            </Text>
          );
        })
      ) : (
        <Text style={styles.itemText}>No nutrition data available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButtonText: { marginLeft: 8, fontSize: 16, color: '#1F508F', fontWeight: 'bold' },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  imagePlaceholder: {
    width: '100%', height: 200, borderRadius: 10, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F508F', textAlign: 'center', marginBottom: 10 },
  timeText: { fontSize: 16, fontWeight: '600', color: textcolors.darkgrey, textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: textcolors.black, marginBottom: 8 },
  itemText: { fontSize: 14, color: textcolors.darkgrey, marginBottom: 5 }
});

export default HomeRecipeDetailsScreen;
