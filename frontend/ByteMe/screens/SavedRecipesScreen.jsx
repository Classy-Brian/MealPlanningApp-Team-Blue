import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import maglass from "@/assets/images/magnifyingglass.png";
import forwardbutton from "@/assets/images/forwardbutton.png";
import { Ionicons } from '@expo/vector-icons';

export default function Recipes() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([
    { id: 1, title: "Spaghetti Bolognese", description: "A classic Italian pasta dish.", imageUri: "https://example.com/spaghetti.jpg", calories: 600, iconUri: "https://example.com/icon1.jpg" },
    { id: 2, title: "Chicken Curry", description: "A flavorful and spicy chicken curry.", imageUri: "https://example.com/curry.jpg", calories: 550, iconUri: "https://example.com/icon2.jpg" },
    { id: 3, title: "Vegetable Stir Fry", description: "A healthy stir fry with fresh vegetables.", imageUri: "https://example.com/stirfry.jpg", calories: 400, iconUri: "https://example.com/icon3.jpg" }
  ]);

  const navigateToRecipeDetails = (recipe) => {
    router.push({
      pathname: '/favoriterecipes',
      params: {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description,
        imageUri: recipe.imageUri,
        calories: recipe.calories,
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
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Recipes List */}
      <FlatList
        data={savedRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.rectangleView} onPress={() => navigateToRecipeDetails(item)}>
            <View style={styles.recipeContainer}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.iconUri }} style={styles.recipeIcon} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.calories}>{item.calories} kcal</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Image source={forwardbutton} style={styles.arrowIcon} />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/explorerecipes')}>
        <Ionicons name="add" size={40} color="#d9d9d9" />
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
    color: '#000',
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
    borderColor: "#777",
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
  },
  recipeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calories: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#000",
    marginTop: 5,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#10386D',
    borderRadius: 50,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
