import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'

export default function Recipes(){
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);

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
      <Text style={styles.title} >Saved Recipes</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
          placeholder='Search through your recipes'
          placeholderTextColor={textcolors.lightgrey}
          style={styles.inputText}
          />
        </View>
      </View>

      <View style={styles.parentContainer}>
      <View style={styles.rectangleView} />
      </View>
      {/* Floating Add Button*/
      }
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add_recipe')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  parentContainer: {
    alignItems: "center", 
    paddingTop: 10, 
  },

  inputContainer: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    backgroundColor: colors.white,
  },
  
  inputText: { flex: 1, 
    fontSize: 20, 
    paddingVertical: 10 
  },

  rectangleView: {
    height: 130,
    borderRadius: 10,
    backgroundColor: "rgba(31, 80, 143, 0.06)",
    borderColor: "#777",
    borderWidth: 1,
    width: "90%",
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#133E7C",
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
    fontSize:30,
    color: '#fff'
  },

  title: {
    fontSize:36,
    frontFamily:fonts.bold,
    textAlign: "center",
    marginVertical: 10
  }

})