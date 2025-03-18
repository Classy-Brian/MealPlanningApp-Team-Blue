import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import maglass from "@/assets/images/magnifyingglass.png";

export default function Recipes() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(''); // Initialize searchQuery state
  const [recipes, setRecipes] = useState([]);

  const handleSearchSubmit = () => {
    // Logic for search submit
    console.log('Search submitted for:', searchQuery);
  };

  const addRecipe = () => {
    const newRecipe = {
      id: recipes.length + 1,
      title: `Recipe ${recipes.length + 1}`,
      description: `This is a short description of Recipe ${recipes.length + 1}.`,
    };
    setRecipes([...recipes, newRecipe]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Recipes</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={maglass} style={styles.magnifyingGlassIcon} />
        <TextInput
          placeholder="Search through your recipes"
          placeholderTextColor={textcolors.lightgrey}
          style={styles.inputText}
          value={searchQuery} // Bind TextInput value to searchQuery
          onChangeText={(text) => setSearchQuery(text)} // Update state on input change
          onSubmitEditing={handleSearchSubmit} // Trigger search on 'Enter'
          returnKeyType="search" // Change return key to 'search'
        />
      </View>

      <View style={styles.parentContainer}>
        <View style={styles.rectangleView} />
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/explorerecipes')}>
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

  parentContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // Explicitly set the height
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%', // Ensure full width of the container
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
    height: 130,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 80, 143, 0.06)',
    borderColor: '#777',
    borderWidth: 1,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
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

  title: {
    fontSize: 36,
    fontFamily: fonts.bold,
    textAlign: 'flex-start',
    marginVertical: 10,
    color: '#000000',
  },
});
