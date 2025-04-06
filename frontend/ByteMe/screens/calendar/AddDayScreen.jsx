import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

import Back_butt from "@/assets/images/backbutton.png";

const AddDayScreen = () => {
  const navigation = useNavigation();

  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const [recipes, setRecipes] = useState([]);

  const [openRecipe1, setOpenRecipe1] = useState(false);
  const [openRecipe2, setOpenRecipe2] = useState(false);
  const [openRecipe3, setOpenRecipe3] = useState(false);

  const [openTime1, setOpenTime1] = useState(false);
  const [openTime2, setOpenTime2] = useState(false);
  const [openTime3, setOpenTime3] = useState(false);

  const [selectedRecipe1, setSelectedRecipe1] = useState(null);
  const [selectedRecipe2, setSelectedRecipe2] = useState(null);
  const [selectedRecipe3, setSelectedRecipe3] = useState(null);

  const [selectedTime1, setSelectedTime1] = useState(null);
  const [selectedTime2, setSelectedTime2] = useState(null);
  const [selectedTime3, setSelectedTime3] = useState(null);

  const morningTimes = [
    { label: '05:00 AM', value: '05:00 AM' },
    { label: '06:00 AM', value: '06:00 AM' },
    { label: '07:00 AM', value: '07:00 AM' },
    { label: '08:00 AM', value: '08:00 AM' },
    { label: '09:00 AM', value: '09:00 AM' },
    { label: '10:00 AM', value: '10:00 AM' },
    { label: '11:00 AM', value: '11:00 AM' },
    { label: '12:00 PM', value: '12:00 PM' },
  ];

  const afternoonTimes = [
    { label: '01:00 PM', value: '01:00 PM' },
    { label: '02:00 PM', value: '02:00 PM' },
    { label: '03:00 PM', value: '03:00 PM' },
    { label: '04:00 PM', value: '04:00 PM' },
    { label: '05:00 PM', value: '05:00 PM' },
    { label: '06:00 PM', value: '06:00 PM' },
    { label: '07:00 PM', value: '07:00 PM' },
    { label: '08:00 PM', value: '08:00 PM' },
  ];

  const dinnerTimes = [
    { label: '09:00 PM', value: '09:00 PM' },
    { label: '10:00 PM', value: '10:00 PM' },
    { label: '11:00 PM', value: '11:00 PM' },
    { label: '12:00 AM', value: '12:00 AM' },
    { label: '01:00 AM', value: '01:00 AM' },
    { label: '02:00 AM', value: '02:00 AM' },
    { label: '03:00 AM', value: '03:00 AM' },
    { label: '04:00 AM', value: '04:00 AM' },
  ];

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
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/saved-recipes`);
        setRecipes(response.data.map(recipe => ({ label: recipe.title, value: recipe.id })));
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  const handleSaveDay = async () => {
    if (!selectedDate || !selectedRecipe1 || !selectedTime1) {
      Alert.alert("Incomplete", "Please complete the morning recipe and time first.");
      return;
    }

    const meals = [
      { meal: "morning", recipeId: selectedRecipe1, time: selectedTime1 }
    ];

    if (selectedRecipe2 && selectedTime2) {
      meals.push({ meal: "afternoon", recipeId: selectedRecipe2, time: selectedTime2 });
    }

    if (selectedRecipe3 && selectedTime3) {
      meals.push({ meal: "dinner", recipeId: selectedRecipe3, time: selectedTime3 });
    }

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/calendar/save-day`, {
        date: selectedDate,
        meals
      });

      Alert.alert("Success", "Day saved successfully!");

      navigation.navigate('CalendarScreen', {
        savedDate: selectedDate,
        savedMeals: meals,
      });
    } catch (err) {
      console.error("Error saving day:", err);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.push('(tabs)', { screen: 'savedrecipes' })}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Recipes to Calendar Day</Text>

      {/* Date Picker */}
      <View style={[styles.pickerWrapper, { zIndex: 3000 }]}> {/* Date */}
        <Text style={styles.label}>Date:</Text>
        <DropDownPicker
          items={dates}
          open={openDatePicker}
          setOpen={setOpenDatePicker}
          value={selectedDate}
          setValue={(val) => {
            setSelectedDate(val);
            setSelectedRecipe1(null);
            setSelectedTime1(null);
            setSelectedRecipe2(null);
            setSelectedTime2(null);
            setSelectedRecipe3(null);
            setSelectedTime3(null);
          }}
          placeholder="Pick a date"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropDownContainer}
        />
      </View>

      {selectedDate && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 2600, marginBottom: 30 }]}>
            <Text style={styles.label}>🥣 Morning Recipe:</Text>
            <DropDownPicker
              items={recipes}
              open={openRecipe1}
              setOpen={setOpenRecipe1}
              value={selectedRecipe1}
              setValue={(val) => setSelectedRecipe1(val)}
              placeholder="Pick a recipe"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 2500, marginBottom: 30 }]}>
            <Text style={styles.label}>🌅 Morning Time:</Text>
            <DropDownPicker
              items={morningTimes}
              open={openTime1}
              setOpen={setOpenTime1}
              value={selectedTime1}
              setValue={(val) => {
                setSelectedTime1(val);
                setSelectedRecipe2(null);
                setSelectedTime2(null);
              }}
              placeholder="Pick a time"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>
        </>
      )}

      {selectedTime1 && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 2000, marginBottom: 30 }]}>
            <Text style={styles.label}>🥗 Afternoon Recipe:</Text>
            <DropDownPicker
              items={recipes}
              open={openRecipe2}
              setOpen={setOpenRecipe2}
              value={selectedRecipe2}
              setValue={(val) => setSelectedRecipe2(val)}
              placeholder="Pick a recipe"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 1900, marginBottom: 30 }]}>
            <Text style={styles.label}>🌞 Afternoon Time:</Text>
            <DropDownPicker
              items={afternoonTimes}
              open={openTime2}
              setOpen={setOpenTime2}
              value={selectedTime2}
              setValue={(val) => {
                setSelectedTime2(val);
                setSelectedRecipe3(null);
                setSelectedTime3(null);
              }}
              placeholder="Pick a time"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>
        </>
      )}

      {selectedTime2 && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 1500, marginBottom: 30 }]}>
            <Text style={styles.label}>🍝 Dinner Recipe:</Text>
            <DropDownPicker
              items={recipes}
              open={openRecipe3}
              setOpen={setOpenRecipe3}
              value={selectedRecipe3}
              setValue={(val) => setSelectedRecipe3(val)}
              placeholder="Pick a recipe"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 1400, marginBottom: 30 }]}>
            <Text style={styles.label}>🌙 Dinner Time:</Text>
            <DropDownPicker
              items={dinnerTimes}
              open={openTime3}
              setOpen={setOpenTime3}
              value={selectedTime3}
              setValue={(val) => setSelectedTime3(val)}
              placeholder="Pick a time"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropDownContainer}
              dropDownDirection="BOTTOM"
            />
          </View>
        </>
      )}

      {selectedRecipe1 && selectedTime1 && (
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveDay}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
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
    padding: 10,
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
  pickerWrapper: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#1F508F"
  },
  dropdown: {
    borderColor: "#1F508F",
    borderWidth: 1,
    borderRadius: 10,
  },
  dropDownContainer: {
    borderColor: "#1F508F",
    borderWidth: 1,
    borderRadius: 10,
  },
  saveButtonWrapper: {
    alignItems: 'center',
    marginVertical: 40,
  },
  saveButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddDayScreen;
