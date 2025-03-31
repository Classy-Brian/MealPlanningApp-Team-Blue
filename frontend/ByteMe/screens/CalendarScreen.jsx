import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import HomeB from "@/assets/images/active.png";
import maglass from "@/assets/images/magnifyingglass.png";
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';
import Back_butt from "@/assets/images/backbutton.png";
import { useRouter } from 'expo-router';

const Calendar = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Calendar</Text>
            </View>
          </View>
        }
      />
      {/* Floating Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/explorerecipes')}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30, // Adjusted for a compact button
    backgroundColor: "#D7E2F1",
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Keeps it aligned to the left
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  header: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.bold,
    textAlign: "center",
    marginVertical: 10,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row', // Align the image and input text horizontally
    alignItems: 'center', // Center items vertically
    height: 50,
    borderRadius: 20,
    borderWidth: 2, // Black border width
    borderColor: 'black', // Set border color to black
    backgroundColor: "#D3D3D3", // The background color can stay as it is or be changed
    paddingHorizontal: 10,
    marginBottom: 10,
    flex: 1,
  },
  
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginRight: 15, // Space between the icon and input
  },
  
  inputText: {
    fontSize: 20,
    paddingVertical: 10,
    flex: 1, // Take up the remaining space
  },
  searchButton: {
    backgroundColor: colors.primary, // Choose any color for the button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    borderColor: "#000",
    borderRadius: 15,
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
  }
});

export default Calendar