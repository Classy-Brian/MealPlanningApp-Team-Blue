import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import maglass from "@/assets/images/magnifyingglass.png";

export default function Recipes() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Retrieve recipe data from params
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.title && params.description) {
      setSavedRecipes((prevRecipes) => [
        ...prevRecipes,
        { id: Date.now(), title: params.title, description: params.description },
      ]);
    }
  }, [params]);

  // Rectangle Component directly inside Recipes.js
  const Rectangle = ({ title, description, imageUri, onPress }) => {
    return (
      <TouchableOpacity style={styles.rectangleView} onPress={onPress}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.recipeImage} />}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </TouchableOpacity>
    );
  };

  const navigateToRecipeDetails = (recipe) => {
    router.push({
      pathname: '/recipedetails', // Assuming this is the path to your RecipeDetailsScreen
      params: {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description,
        imageUri: recipe.imageUri,
        // Add other recipe properties here (ingredients, directions, etc.)
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Saved Recipes</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={maglass} style={styles.magnifyingGlassIcon} />
        <TextInput
          placeholder="Search through your recipes"
          placeholderTextColor={textcolors.lightgrey}
          style={styles.inputText}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          returnKeyType="search"
        />
      </View>

      {/* Recipes List */}
      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Rectangle
            title={item.title}
            description={item.description}
            imageUri={item.imageUri}
            onPress={() => navigateToRecipeDetails(item)} // Pass item to the navigate function
          />
        )}
      />

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push('/explorerecipes')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  pageTitle: {
    fontSize: 36,
    fontFamily: fonts.bold,
    marginVertical: 10,
    color: '#000000',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
  },

  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },

  inputText: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 10,
  },

  rectangleView: {
    borderRadius: 10,
    backgroundColor: "rgba(31, 80, 143, 0.06)",
    borderStyle: "solid",
    borderColor: "#777",
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  description: {
    fontSize: 14,
    color: "#555",
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
});
