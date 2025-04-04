import React, { useState, useEffect } from 'react'; 
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

import Back_butt from "@/assets/images/backbutton.png";
import Sunset from "@/assets/images/sunset.png";
import Sun from "@/assets/images/sun.png";
import Moon from "@/assets/images/moon.png";

const AddDayScreen = () => {
  const navigation = useNavigation();

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [morningTimes] = useState([
    { label: '05:00 AM', value: '05:00 AM' },
    { label: '06:00 AM', value: '06:00 AM' },
    { label: '07:00 AM', value: '07:00 AM' },
    { label: '08:00 AM', value: '08:00 AM' },
    { label: '09:00 AM', value: '09:00 AM' },
    { label: '10:00 AM', value: '10:00 AM' },
    { label: '11:00 AM', value: '11:00 AM' },
    { label: '12:00 PM', value: '12:00 PM' },
  ]);

  const [afternoonTimes] = useState([
    { label: '01:00 PM', value: '01:00 PM' },
    { label: '02:00 PM', value: '02:00 PM' },
    { label: '03:00 PM', value: '03:00 PM' },
    { label: '04:00 PM', value: '04:00 PM' },
  ]);

  const [dinnerTimes] = useState([
    { label: '05:00 PM', value: '05:00 PM' },
    { label: '06:00 PM', value: '06:00 PM' },
    { label: '07:00 PM', value: '07:00 PM' },
    { label: '08:00 PM', value: '08:00 PM' },
  ]);

  const [selectedTime, setSelectedTime] = useState(null);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openRecipePicker, setOpenRecipePicker] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [recipeIndex, setRecipeIndex] = useState(0); // Keep track of the current recipe index

  useEffect(() => {
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return { label: date.toDateString(), value: date.toDateString() };
    });
    setDates(weekDates);

    const fetchRecipes = async () => {
      try {
        const response = await axios.get(process.env.EXPO_PUBLIC_BACKEND_URL + '/api/users/saved-recipes');
        setRecipes(response.data.map(recipe => ({ label: recipe.title, value: recipe.id })));
        console.log("Fetched Recipes:", response.data); // Debugging the recipes
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  // Handle Date Selection
  const handleDateSelection = (value) => {
    console.log("Selected Date:", value); // Debugging date selection
    setSelectedDate(value);
    setShowDropdowns(true); // Show the dropdowns after selecting the date
  };

  // Handle Time Selection
  const handleTimeSelection = (value) => {
    console.log("Selected Time:", value); // Debugging time selection
    setSelectedTime(value);
  };

  // Increment the recipe index for alternating morning, afternoon, dinner
  const handleRecipeSelection = (recipeId) => {
    console.log("Selected Recipe ID:", recipeId); // Debugging recipe selection
    setSelectedRecipe(recipeId);
    setRecipeIndex(recipeIndex + 1); // Move to the next recipe
  };

  // Logic for alternating between morning, afternoon, and dinner times
  const getTimeForRecipe = () => {
    if (recipeIndex % 3 === 0) {
      return morningTimes;
    } else if (recipeIndex % 3 === 1) {
      return afternoonTimes;
    } else {
      return dinnerTimes;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.push('(tabs)', { screen: 'savedrecipes' })}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Recipes to Calendar Day</Text>

      {/* Date Picker */}
      <View style={[styles.pickerContainer, { zIndex: 300 }]}>
        <TouchableOpacity style={styles.blueBox}>
          <Text style={styles.blueBoxText}>Date:</Text>
        </TouchableOpacity>

        <DropDownPicker
          items={dates}
          open={openDatePicker}
          setOpen={setOpenDatePicker}
          value={selectedDate}
          setValue={handleDateSelection}
          placeholder="Select Date"
          containerStyle={styles.dropdownContainer}
          style={styles.dropdownStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
          mode="BADGE"
        />
      </View>

      {/* Show recipe dropdown after selecting a date */}
      {showDropdowns && (
        <>
          {/* Recipe Picker */}
          {recipes.length > 0 && recipeIndex < recipes.length && (
            <View style={[styles.pickerContainer, { zIndex: 200 }]}>
              <TouchableOpacity style={styles.blueBox}>
                <Text style={styles.blueBoxText}>Recipe {recipeIndex + 1}:</Text>
              </TouchableOpacity>

              <DropDownPicker
                items={recipes}
                open={openRecipePicker}
                setOpen={setOpenRecipePicker}
                value={selectedRecipe}
                setValue={handleRecipeSelection}
                placeholder="Select Recipe"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdownStyle}
                dropDownContainerStyle={styles.dropDownContainerStyle}
                mode="BADGE"
              />
            </View>
          )}

          {/* Time Picker for the current recipe */}
          {selectedRecipe && recipeIndex < recipes.length && (
            <View style={[styles.pickerContainer, { zIndex: 100 }]}>
              <TouchableOpacity style={styles.blueBox}>
                <Text style={styles.blueBoxText}>Time for Recipe {recipeIndex + 1}:</Text>
              </TouchableOpacity>

              <DropDownPicker
                items={getTimeForRecipe()}
                open={openTimePicker}
                setOpen={setOpenTimePicker}
                value={selectedTime}
                setValue={handleTimeSelection}
                placeholder="Select Time"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdownStyle}
                dropDownContainerStyle={styles.dropDownContainerStyle}
                mode="BADGE"
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: "#D7E2F1",
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  backText: {
    fontSize: 16,
    color: '#000',
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    backgroundColor: "#1F508F",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: 'center',
    color: '#fff',
  },

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 70,
  },

  blueBox: {
    backgroundColor: "#1F508F",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  blueBoxText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  dropdownContainer: {
    width: 180,
    zIndex: 1000,
  },

  dropdownStyle: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
  },

  dropDownContainerStyle: {
    borderWidth: 1,
    borderColor: "#1F508F",
  },

  imageWrapper: {
    width: 60,
    height: 60,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderRadius: 60, // Makes it round if needed
  },

  timeImage: {
    width: 60,
    height: 60,
    alignSelf: 'flex-start',
    marginBottom: -50,
    zIndex: 101,
    tintColor: '#DC9729', // Change color of the sun image
  },
});

export default AddDayScreen;
