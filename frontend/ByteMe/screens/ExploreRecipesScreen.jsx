import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import HomeB from "@/assets/images/active.png";
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
    fetchRecipes('');
  }, []);

  const fetchRecipes = async (query) => {
    const API_ID = process.env.EDAMAM_APP_ID;
    const API_KEY = process.env.EDAMAM_API_KEY;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${API_ID}&app_key=${API_KEY}`
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
    });
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Image source={Back_butt} style={styles.backIcon} />
              <Text style={styles.backText}>Recipes</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Search Recipes</Text>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search Recipes"
                placeholderTextColor={textcolors.lightgrey}
                style={styles.inputText}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  fetchRecipes(text);
                }} 
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
    paddingTop: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#D7E2F1",
    borderRadius: 5,
    marginBottom: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
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
    paddingVertical: 10,
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
    borderColor: "#000000",
    borderRadius: 10,
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
