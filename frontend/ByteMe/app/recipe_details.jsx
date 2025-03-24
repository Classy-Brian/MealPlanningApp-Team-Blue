import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// This screen will show the detailed recipe information
const RecipeDetails = ({ route }) => {
  const { title, ingredients, allergies, directions } = route.params;

    

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sectionTitle}>Ingredients:</Text>
      <Text style={styles.text}>{ingredients}</Text>
      <Text style={styles.sectionTitle}>Allergies:</Text>
      <Text style={styles.text}>{allergies}</Text>
      <Text style={styles.sectionTitle}>Directions:</Text>
      <Text style={styles.text}>{directions}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    lineHeight: 24,
  },
});

export default RecipeDetails;