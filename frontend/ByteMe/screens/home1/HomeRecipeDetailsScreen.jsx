import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Back_butt from '@/assets/images/backbutton.png';

const HomeRecipeDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipe } = route.params; // we expect { label, imageUri, ingredients, directions }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Image source={{ uri: recipe.imageUri }} style={styles.image} />

      <Text style={styles.title}>{recipe.label}</Text>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.textItem}>• {ingredient}</Text>
        ))
      ) : (
        <Text style={styles.textItem}>No ingredients listed.</Text>
      )}

      <Text style={styles.sectionTitle}>Directions</Text>
      <Text style={styles.textItem}>
        {recipe.directions || "No directions available."}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    backgroundColor: "#D7E2F1", padding: 10, borderRadius: 10, alignSelf: 'flex-start'
  },
  backIcon: { width: 20, height: 20, marginRight: 5 },
  backText: { fontSize: 16, color: '#000' },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1F508F' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#1F508F' },
  textItem: { fontSize: 16, marginBottom: 5, color: '#333' },
});

export default HomeRecipeDetailsScreen;
