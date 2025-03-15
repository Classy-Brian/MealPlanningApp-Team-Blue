import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const RecipeDetailsScreen = ({ route }) => {
  // Destructure the params passed from RecipeSearch
  const { title, ingredients, directions } = route.params;

  // Error handling if route.params is not available
  if (!route.params) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No recipe data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Recipe Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Ingredients Section */}
      <Text style={styles.sectionTitle}>Ingredients:</Text>
      <View style={styles.listContainer}>
        {ingredients.length > 0 ? (
          ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>{ingredient}</Text>
          ))
        ) : (
          <Text style={styles.ingredient}>No ingredients available.</Text>
        )}
      </View>

      {/* Directions Section */}
      <Text style={styles.sectionTitle}>Directions:</Text>
      <Text style={styles.directions}>
        {directions ? directions : 'Directions are not available for this recipe.'}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
  },
  listContainer: {
    marginVertical: 10,
  },
  ingredient: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  directions: {
    fontSize: 16,
    marginVertical: 10,
    color: '#555',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default RecipeDetailsScreen;
