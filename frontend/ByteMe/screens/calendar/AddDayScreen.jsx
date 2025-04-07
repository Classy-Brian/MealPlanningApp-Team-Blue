import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import getUserIdFromToken from '@/components/getUserIdFromToken';
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

  const [extraMeals, setExtraMeals] = useState([]);
  const [userId, setUserId] = useState(null);

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

  const timeOptions = [...morningTimes, ...afternoonTimes, ...dinnerTimes];

  useEffect(() => {
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return { label: date.toDateString(), value: date.toDateString() };
    });
    setDates(weekDates);
  }, []);

  //Fetch user ID & saved recipes
  useEffect(() => {
    const fetchUserIdAndRecipes = async () => {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${id}/get-saved-recipes`
        );

        const formatted = response.data.savedRecipes.map((recipe, index) => ({
          label: recipe.label || `Recipe ${index + 1}`,
          value: recipe.id || recipe._id || recipe.uri || `recipe-${index}`, // <- match this to what gets sent to backend
        }));

        setRecipes(formatted);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        setRecipes([]);
      }
    };

    fetchUserIdAndRecipes();
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

    extraMeals.forEach((entry) => {
      if (entry.recipeId && entry.time) {
        meals.push({ meal: "extra", recipeId: entry.recipeId, time: entry.time });
      }
    });

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
        date: selectedDate,
        meals
      });

      Alert.alert("Success", "Day saved successfully!");
      navigation.push('(tabs)', {
        screen: 'calendar',
        params: {
          savedDate: selectedDate,
          savedMeals: meals,
        }
      });
    } catch (err) {
      console.error("Error saving day:", err);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  };

  const addExtraMeal = () => {
    setExtraMeals((prev) => [
      ...prev,
      {
        recipeId: null,
        time: null,
        openRecipe: false,
        openTime: false
      }
    ]);
  };

  const updateExtraMeal = (index, key, value) => {
    setExtraMeals((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.push('(tabs)', { screen: 'calendar' })}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Recipes to Calendar Day</Text>

      {/* Date Picker */}
      <View style={[styles.pickerWrapper, { zIndex: 3000 }]}>
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
            setExtraMeals([]);
          }}
          placeholder="Pick a date"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropDownContainer}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Morning */}
      {selectedDate && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 2600 }]}>
            <Text style={styles.label}>Morning Recipe:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 2500 }]}>
            <Text style={styles.label}>Morning Time:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>
        </>
      )}

            {/* Afternoon */}
            {selectedTime1 && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 2000 }]}>
            <Text style={styles.label}>Afternoon Recipe:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 1900 }]}>
            <Text style={styles.label}>Afternoon Time:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>
        </>
      )}

      {/* Dinner */}
      {selectedTime2 && (
        <>
          <View style={[styles.pickerWrapper, { zIndex: 1500 }]}>
            <Text style={styles.label}>Dinner Recipe:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>

          <View style={[styles.pickerWrapper, { zIndex: 1400 }]}>
            <Text style={styles.label}>Dinner Time:</Text>
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
              listMode="SCROLLVIEW"
            />
          </View>

          {/* Add Extra Button - appears right after Dinner */}
          <View style={styles.addExtraWrapper}>
            <TouchableOpacity onPress={addExtraMeal} style={styles.addExtraButton}>
              <Text style={styles.addExtraText}>+ Add Another Recipe</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Extra Meals */}
      {extraMeals.map((meal, index) => {
        const z = 1300 - index * 10;
        const isLast = index === extraMeals.length - 1;

        return (
          <View key={index}>
            {/* Recipe Picker */}
            <View style={[styles.pickerWrapper, { zIndex: z }]}>
              <Text style={styles.label}>Recipe:</Text>
              <DropDownPicker
                items={recipes}
                open={meal.openRecipe ?? false}
                setOpen={(open) => updateExtraMeal(index, 'openRecipe', open)}
                value={meal.recipeId ?? null}
                setValue={(val) => updateExtraMeal(index, 'recipeId', val)}
                placeholder="Pick a recipe"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                dropDownDirection="BOTTOM"
                listMode="SCROLLVIEW"
              />
            </View>

            {/* Time Picker */}
            <View style={[styles.pickerWrapper, {
              zIndex: z - 1,
              marginBottom: isLast ? 150 : 30
            }]}>
              <Text style={styles.label}>Time:</Text>
              <DropDownPicker
                items={timeOptions}
                open={meal.openTime ?? false}
                setOpen={(open) => updateExtraMeal(index, 'openTime', open)}
                value={meal.time ?? null}
                setValue={(val) => updateExtraMeal(index, 'time', val)}
                placeholder="Pick a time"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropDownContainer}
                dropDownDirection="BOTTOM"
                listMode="SCROLLVIEW"
              />
            </View>
          </View>
        );
      })}

      {/* Save Button */}
      <View style={styles.saveButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: selectedRecipe1 && selectedTime1 ? '#4CAF50' : '#ccc' }
          ]}
          onPress={handleSaveDay}
          disabled={!(selectedRecipe1 && selectedTime1)}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 5, // Optional: spacing between label and dropdown
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
    width: 200,
    borderRadius: 10,
  },
  dropDownContainer: {
    borderColor: "#1F508F",
    borderWidth: 1,
    width: 200,
    borderRadius: 10,
  },
  addExtraWrapper: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  addExtraButton: {
    backgroundColor: '#e6eefc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addExtraText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F508F',
  },
  saveButtonWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
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



  