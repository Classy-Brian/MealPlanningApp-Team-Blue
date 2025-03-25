import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; 

import HomeB from '../../assets/images/active.png';
import { colors } from '../../components/Colors';
import { textcolors } from '../../components/TextColors';
import { fonts } from '../../components/Fonts'
import Back_butt from '../../assets/images/backbutton.png';
import AddRecipeScreen from '@/app/(recipe)/addrecipe';


const initialData = [
  { id: "1", title: "Croque Monsieur", imageUri: null, ingredients: [], allergies: [], directions: "" },
  { id: "2", title: "Chicken Parmesan Pasta", imageUri: null, ingredients: [], allergies: [], directions: "" },
  { id: "3", title: "Homemade Ratatouille", imageUri: null, ingredients: [], allergies: [], directions: "" },
  { id: "4", title: "Street Taco", imageUri: null, ingredients: [], allergies: [], directions: "" },
  { id: "5", title: "Honey Garlic Shrimp", imageUri: null, ingredients: [], allergies: [], directions: "" },
];

const RecipeCard = ({ imageUri, title, onPress }) => {
  const safeImageUri = imageUri && imageUri.startsWith("http") ? { uri: imageUri } : HomeB;

  return (
    <TouchableOpacity style={styles.recipeContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.recipeWrapper}>
        <Image style={styles.recipePhoto} resizeMode="cover" source={safeImageUri} />
        <View style={styles.overlay} />
        <Text style={styles.recipeTitle}>{title || "No Title Available"}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Add_Recipe = () => {
  const [recipes, setRecipes] = useState([]);
  const navigation = useNavigation(); 

  useEffect(() => {
    const requiredCount = 10;
    let updatedData = [...initialData];

    if (updatedData.length < requiredCount) {
      const placeholders = Array.from({ length: requiredCount - updatedData.length }, (_, index) => ({
        id: `placeholder-${index}`,
        title: "Empty Slot",
        ingredients: [],
        allergies: [],
        directions: "",
      }));
      updatedData = updatedData.concat(placeholders);
    }

    setRecipes(updatedData.slice(0, requiredCount));
  }, []);

  const goToRecipeDetails = (recipe) => {
    navigation.navigate('recipe_details', {
      title: recipe.title,
      ingredients: recipe.ingredients.length ? recipe.ingredients : ["No ingredients available"],
      allergies: recipe.allergies.length ? recipe.allergies : ["No allergy information"],
      directions: recipe.directions || "No directions available",
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("recipe")}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={Back_butt} style={styles.backIcon} />
                <Text style={styles.backText}>Recipes</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>Search Recipes</Text>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search Recipes"
                placeholderTextColor={textcolors?.lightgrey || "#A9A9A9"}
                style={styles.inputText}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard 
            title={item.title} 
            imageUri={item.imageUri} 
            onPress={() => goToRecipeDetails(item)} 
          />
        )}
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
    zIndex: 10,
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
    fontFamily: fonts?.bold || "System",
    textAlign: "center",
    marginVertical: 10,
  },

  searchContainer: {
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: textcolors?.lightgrey || "#A9A9A9",
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
    fontFamily: "Afacad",
    color: "#fff",
    textAlign: "center",
    opacity: 0.8,
  },
});

export default AddRecipeScreen;