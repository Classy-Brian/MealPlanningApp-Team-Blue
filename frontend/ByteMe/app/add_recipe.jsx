import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Pressable } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';

const Add_Recipe = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title} >Search Recipes</Text>
    
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
          placeholder='Search recipes'
          placeholderTextColor={textcolors.lightgrey}
          style={styles.inputText}
          />
        </View>
      </View>
      <TouchableOpacity style= {styles.recipePhotoParent} onPress={() =>  {}}>
        <View style={styles.overlay} />
        <Text style={styles.recipeTitle}>Food</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Add_Recipe

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  title: {
    fontSize:36,
        frontFamily:fonts.bold,
        textAlign: "center",
        marginVertical: 10
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

  inputText: { 
    flex: 1, 
    fontSize: 20, 
    paddingVertical: 10 
  },

  overlay: {
    position: "absolute",
    top: 12,
    left: 0,
    width: "100%",
    height: 24,
    backgroundColor: "rgba(31, 80, 143, 0.8)",
    borderRadius: 10,
  },

  recipePhotoParent: {
    marginTop: 20,
    alignSelf: "center",
    width: 180,
    height: 180,
  },

  recipeTitle: {
    position: "absolute",
    top: 16,
    width: "100%",
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Afacad",
    color: "#fff",
    textAlign: "center",
  },











})