import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, Image
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';
import { fonts } from '../../components/Fonts';

export default function Recipes() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
  const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
  const USER_ID = "67d3a9717c654c6be6f07502"; // Replace with actual user authentication

  // Fetch saved recipes from the backend
  const fetchSavedRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:${PORT}/api/users/${USER_ID}/get-saved-recipes`);
      
      if (!response.data || response.data.length === 0) {
        console.warn("No saved recipes found.");
        setSavedRecipes([]);
        setLoading(false);
        return;
      }

      
      // Fetch full recipe details from Edamam API
      const recipeDetailsPromises = response.data.map((uri) =>
        axios.get(`https://api.edamam.com/search?r=${encodeURIComponent(uri)}&app_id=${API_ID}&app_key=${API_KEY}`)
      );

      const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
      const detailedRecipes = recipeDetailsResponses.map(res => {
        if (!res.data[0]) return null; // Skip if missing data
        return {
          uri: res.data[0].uri,
          label: res.data[0].label,
          image: res.data[0].image || "https://via.placeholder.com/150",
          directions: res.data[0].url || "No directions available.",
          ingredients: res.data[0].ingredientLines, 
          allergies: res.data[0].healthLabels,
          nutrition: res.data[0].totalNutrients
        };
      }).filter(Boolean);  // Remove null values
      setSavedRecipes(detailedRecipes);
      setError(null);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      setError("Failed to load saved recipes.");
      Alert.alert("Error", "Could not load saved recipes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  // Handle search in saved recipes
  const filteredRecipes = savedRecipes.filter((recipe) =>
    recipe.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Recipes</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder='Search through your recipes'
            placeholderTextColor={textcolors.lightgrey}
            style={styles.inputText}
            value={query}
            onChangeText={(text) => setQuery(text)}
          />
        </View>
      </View>

      {/* Display Loading */}
      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      {/* Display Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* List of Saved Recipes */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeContainer} 
            onPress={() => 
                router.push({
                  pathname: "../favoriterecipes",
                  params: {
                    recipeId: item.uri,  
                    title: item.label,
                    imageUri: item.image || item.images?.THUMBNAIL?.url || "https://via.placeholder.com/150",
                    ingredients: item.ingredients || [],  //  Send as an array, no JSON.stringify()
                    directions: item.directions || "No directions available.",
                    allergies: item.allergies || [],  //  Send as an array
                    nutrition: JSON.stringify(item.nutrition)
                  }
                })}
          >
            <View style={styles.rectangleView}>
              <Image 
                source={{ uri: item.image }}  
                style={styles.recipeImage} 
              />
              <Text style={styles.recipeTitle}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={styles.noRecipesText}>No saved recipes found.</Text>}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/explorerecipes')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  inputContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    backgroundColor: colors.white,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: "center",
    marginBottom: 10,
    color: colors.primary,
  },
  recipeContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  rectangleView: {
    height: 150,
    borderRadius: 10,
    backgroundColor: "rgba(31, 80, 143, 0.06)",
    borderColor: "#777",
    borderWidth: 1,
    width: "90%",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#133E7C",
    marginTop: 5,
  },
  noRecipesText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#133E7C',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});