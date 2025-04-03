import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import Back_butt from "@/assets/images/backbutton.png";

const AddDayScreen = () => {
  const navigation = useNavigation();
  
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [times] = useState([
    { label: '08:00 AM', value: 'morning' },
    { label: '12:00 PM', value: 'afternoon' },
    { label: '06:00 PM', value: 'dinner' }
  ]);
  
  const [selectedTime, setSelectedTime] = useState(null);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openRecipePicker, setOpenRecipePicker] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState(false);

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
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.push('(tabs)', { screen: 'savedrecipes' })}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Add Recipes to Calendar Day</Text>

      {/* Date Picker Section */}
      <View style={[styles.pickerContainer, { zIndex: 300 }]}>
        <TouchableOpacity style={styles.blueBox}>
          <Text style={styles.blueBoxText}>Date:</Text>
        </TouchableOpacity>
        
        <DropDownPicker
          items={dates}
          open={openDatePicker}
          setOpen={setOpenDatePicker}
          value={selectedDate}
          setValue={(value) => {
            setSelectedDate(value);
            setShowDropdowns(true);
          }}
          placeholder="Select Date"
          containerStyle={styles.dropdownContainer}
          style={styles.dropdownStyle}
          dropDownContainerStyle={styles.dropDownContainerStyle}
          mode="BADGE"
        />
      </View>

      {showDropdowns && (
        <>
          {/* Recipes Picker */}
          <View style={[styles.pickerContainer, { zIndex: 200 }]}>
            <TouchableOpacity style={styles.blueBox}>
              <Text style={styles.blueBoxText}>Recipe:</Text>
            </TouchableOpacity>

            <DropDownPicker
              items={recipes}
              open={openRecipePicker}
              setOpen={setOpenRecipePicker}
              value={selectedRecipe}
              setValue={setSelectedRecipe}
              placeholder="Select Recipe"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropDownContainerStyle}
              mode="BADGE"
            />
          </View>

          {/* Time Picker */}
          <View style={[styles.pickerContainer, { zIndex: 100 }]}>
            <TouchableOpacity style={styles.blueBox}>
              <Text style={styles.blueBoxText}>Time:</Text>
            </TouchableOpacity>

            <DropDownPicker
              items={times}
              open={openTimePicker}
              setOpen={setOpenTimePicker}
              value={selectedTime}
              setValue={setSelectedTime}
              placeholder="Select Time"
              containerStyle={styles.dropdownContainer}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropDownContainerStyle}
              mode="BADGE"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },

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
  backIcon: { width: 20, height: 20, marginRight: 5 },
  backText: { fontSize: 16, color: '#000' },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    marginBottom: 15,
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
  }
});

export default AddDayScreen;
