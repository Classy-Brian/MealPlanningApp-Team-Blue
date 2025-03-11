import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { colors } from '../../components/Colors'
import { textcolors} from '../../components/TextColors'
import { fonts } from '../../components/Fonts'

export default function Recipes(){
  const router = useRouter();
  return (
    
    <View style={styles.container}>
      <Text style={styles.title} >Saved Recipes</Text>
      {/* Floating Add Button */}
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
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({

  parentContainer: {
    flex: 1, 
    justifyContent: "flex-start",
    alignItems: "center", 
    paddingTop: 10, 
  },

  searchContainer: {
    flexDirection: "row", // Aligns items horizontally
    alignItems: "center", // Keeps items aligned vertically
    justifyContent: "space-between", // Adds space between items
    width: "90%", // Adjust as needed
    alignSelf: "center", // Centers in parent
    marginTop: 20, // Adds some spacing
  },

  container: {
    flex: 1,
    backgroundColor: '#fff', // full white background
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#A9BCD0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#EEF2F7',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  calorieBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calorieLow: {
    flex: 1,
    backgroundColor: '#B93E3E',
  },
  calorieMid: {
    flex: 1,
    backgroundColor: '#7EB77F',
  },
  calorieHigh: {
    flex: 1,
    backgroundColor: '#B93E3E',
  },
  calorieLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  recipeProgress: {
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A9BCD0',
  },
  recipeFill: {
    width: '40%',
    backgroundColor: '#A9BCD0',
    height: '100%',
  },
  recipeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
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
    fontSize: 48,
    fontFamily: fonts.bold,
  },
  inputContainer: {
    flex: 1, // Takes up available space
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    backgroundColor: colors.white,
    marginRight: 10, // Adds spacing between search bar and rectangle
  },
  rectangleView: {
    height: 130,
    borderRadius: 10,
    backgroundColor: "rgba(31, 80, 143, 0.06)",
    borderStyle: "solid",
    borderColor: "#777",
    borderWidth: 1,
    width: "90%"
  },
  inputText: {
    flex: 1, 
    fontSize: 20, // Makes text bigger
    textAlignVertical: "center", // Centers text vertically
    paddingVertical: 10, // Ensures better spacing inside input
  }
})