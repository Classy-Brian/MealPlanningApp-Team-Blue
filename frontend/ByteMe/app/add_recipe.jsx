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











})