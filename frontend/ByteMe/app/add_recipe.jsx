import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation for navigation
import HomeB from "@/assets/images/active.png";
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';

const initialData = [
  { id: "1", title: "Croque Monsieur", imageUri: null },
  { id: "2", title: "Chicken Parmesan Pasta", imageUri: null },
  { id: "3", title: "Homemade Ratatouille", imageUri: null },
  { id: "4", title: "Street Taco", imageUri: null },
  { id: "5", title: "Honey Garlic Shrimp", imageUri: null },
];

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const RecipeCard = ({ imageUri, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.recipeContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.recipeWrapper}> 
        <Image
          style={styles.recipePhoto}
          resizeMode="cover"
          source={imageUri ? { uri: imageUri } : HomeB} 
        />
        <View style={styles.overlay} />
        <Text style={styles.recipeTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const Add_Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const requiredCount = 10;
    let updatedData = [...initialData];

    // If fewer than 10 items, fill with placeholders
    if (updatedData.length < requiredCount) {
      const placeholders = Array.from({ length: requiredCount - updatedData.length }, (_, index) => ({
        id: `placeholder-${index}`,
        title: "Empty Slot"
      }));
      updatedData = updatedData.concat(placeholders);
    }

    setRecipes(updatedData.slice(0, requiredCount)); // Ensure exactly 10 items
  }, []);

  const goToRecipeDetails = (recipe) => {
    navigation.navigate('recipe_details', {
      title: recipe.title,
      ingredients: recipe.ingredients,
      allergies: recipe.allergies,
      directions: recipe.directions,
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Search Recipes</Text>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search recipes"
                placeholderTextColor={textcolors.lightgrey}
                style={styles.inputText}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
        <RecipeCard title={item.title} 
        imageUri={item.imageUri} 
        onPress={() => goToRecipeDetails(item)} // Navigate to details screen/>}
        />
        )}
      />
    </View>
  );
}

export default Add_Recipe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },

  backButton: {
    marginTop: 20,  // Move it into the normal flow of the screen
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#1F508F",
    borderRadius: 5,
    zIndex: 1, // Ensures it's above other elements
  },

  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    paddingBottom: 20,
  },

  title: {
    fontSize: 36,
    fontFamily: fonts.bold,
    textAlign: "center",
    marginVertical: 10,
  },

  searchContainer: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  inputText: { 
    fontSize: 20, 
    paddingVertical: 10 
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },

  recipeContainer: {
    width: "48%",
    aspectRatio: 1,
  },

  recipeWrapper: {
    width: "100%",
    height: "100%",
    borderWidth: 3, 
    borderColor: "#1F508F", 
    borderRadius: 10, 
    overflow: "hidden",
  },

  recipePhoto: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(31, 80, 143, 0.8)",
    width: "100%",
    height: 40,
  },

  recipeTitle: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Afacad",
    color: "#fff",
    textAlign: "center",
  },
});
