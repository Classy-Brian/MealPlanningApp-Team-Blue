import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import HomeB from "@/assets/images/active.png";
import maglass from "@/assets/images/magnifyingglass.png";
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import Back_butt from "@/assets/images/backbutton.png";

const RecipeCard = ({ imageUri, title, onPress }) => (
  <TouchableOpacity style={styles.recipeContainer} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.recipeWrapper}>
      <Image style={styles.recipePhoto} resizeMode="cover" source={imageUri ? { uri: imageUri } : HomeB} />
      <View style={styles.overlay} />
      <Text style={styles.recipeTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const RecipeSearch = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    setRecipes([
        // { recipe: { label: "Test Recipe 1", image: "https://via.placeholder.com/150", uri: "https://example.com/recipe1", ingredientLines: ["1 Cup of flour", "2 Eggs"], url: "https://example.com" }},
        // { recipe: { label: "Test Recipe 2", image: "https://via.placeholder.com/150", uri: "https://example.com/recipe2", ingredientLines: ["1 Cup of sugar", "3 Eggs"], url: "https://example.com" }},
        // { recipe: { label: "Test Recipe 3", image: "https://via.placeholder.com/150", uri: "https://example.com/recipe3", ingredientLines: ["2 Cups of milk", "1 tbsp vanilla"], url: "https://example.com" }},
      ]);
  }, []);

  const fetchRecipes = async (query) => {
    const API_ID =process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY =process.env.EXPO_PUBLIC_EDAMAM_API_KEY;

    setLoading(true);
    setError(null);
    try {  
      const response = await axios.get(
        `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${API_ID}&app_key=${API_KEY}`,
      );
      setRecipes(response.data.hits.length > 0 ? response.data.hits : []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const goToRecipeDetails = (recipe) => {
    navigation.navigate('recipedetails', {
      recipeId: recipe.recipe.uri,
      title: recipe.recipe.label,
      ingredients: recipe.recipe.ingredientLines,
      directions: recipe.recipe.url,
      imageUri: recipe.recipe.image,
      allergies: recipe.recipe.healthLabels,
      nutrition: recipe.recipe.totalNutrients
    });
  };

  const handleSearchSubmit = () => {
    fetchRecipes(searchQuery); // Fetch recipes when "Enter" is pressed
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.push('(tabs)', { screen: 'savedrecipes' })}
            >
              <Image source={Back_butt} style={styles.backIcon} />
              <Text style={styles.backText}>Recipes</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Search Recipes</Text>
            </View>
            <View style={styles.searchContainer}>
              <Image source={maglass} style={styles.magnifyingGlassIcon} />
              <TextInput
                placeholder="Search Recipes"
                placeholderTextColor={textcolors.lightgrey}
                style={styles.inputText}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)} // Update the state without fetching
                onSubmitEditing={handleSearchSubmit} // Fetch when user presses "Enter"
                returnKeyType="search"
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            title={item.recipe.label}
            imageUri={item.recipe.image}
            onPress={() => goToRecipeDetails(item)}
          />
        )}
        ListFooterComponent={loading && <Text>Loading...</Text>}
        contentContainerStyle={{ paddingTop: 60 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30, // Adjusted for a compact button
    backgroundColor: "#D7E2F1",
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Keeps it aligned to the left
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
  header: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.bold,
    textAlign: "center",
    marginVertical: 10,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row', // Align the image and input text horizontally
    alignItems: 'center', // Center items vertically
    height: 50,
    borderRadius: 20,
    borderWidth: 2, // Black border width
    borderColor: 'black', // Set border color to black
    backgroundColor: "#D3D3D3", // The background color can stay as it is or be changed
    paddingHorizontal: 10,
    marginBottom: 10,
    flex: 1,
  },
  
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginRight: 15, // Space between the icon and input
  },
  
  inputText: {
    fontSize: 20,
    paddingVertical: 10,
    flex: 1, // Take up the remaining space
  },
  searchButton: {
    backgroundColor: colors.primary, // Choose any color for the button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    borderColor: "#000",
    borderRadius: 15,
    overflow: "hidden",
  },
  recipePhoto: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    backgroundColor: "rgba(31, 80, 143, 0.8)",
    width: "100%",
    height: 40,
    opacity: 0.8,
  },
  recipeTitle: {
    position: "absolute",
    top: 10,
    width: "100%",
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
  },
});

export default RecipeSearch;
