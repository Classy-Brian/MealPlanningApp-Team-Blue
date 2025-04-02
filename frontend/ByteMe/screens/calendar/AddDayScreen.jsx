import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

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
  const [showMorning, setShowMorning] = useState(false);
  const [showAfternoon, setShowAfternoon] = useState(false);
  const [showDinner, setShowDinner] = useState(false);

  useEffect(() => {
    // Generate dates for the current week
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return { label: date.toDateString(), value: date.toDateString() };
    });
    setDates(weekDates);

    // Fetch saved recipes
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Calendar</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Add Recipes to Calendar Day</Text>

      {/* Date Picker */}
      <View style={{ zIndex: 3000, elevation: 3 }}>
        <DropDownPicker
          items={dates}
          open={openDatePicker}
          setOpen={setOpenDatePicker}
          value={selectedDate}
          setValue={(val) => {
            setSelectedDate(val);
            setShowMorning(true); // Show morning section after date selection
          }}
          placeholder="Select a day"
          containerStyle={styles.dropdown}
        />
      </View>

      {/* Morning Section */}
      {showMorning && (
        <View style={{ zIndex: 2000, elevation: 2 }}>
          <Text style={styles.sectionTitle}>Morning</Text>
          <DropDownPicker
            items={times.filter(t => t.value === 'morning')}
            open={openTimePicker}
            setOpen={setOpenTimePicker}
            value={selectedTime}
            setValue={setSelectedTime}
            placeholder="Select a time"
            containerStyle={styles.dropdown}
          />
          <ScrollView style={styles.recipeList}>
            {recipes.map(recipe => (
              <TouchableOpacity 
                key={recipe.value} 
                style={[styles.recipeItem, selectedRecipe === recipe.value && styles.selectedRecipe]} 
                onPress={() => {
                  setSelectedRecipe(recipe.value);
                  setShowAfternoon(true); // Show afternoon section after morning selection
                }}>
                <Text style={styles.recipeText}>{recipe.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Afternoon Section */}
      {showAfternoon && (
        <View style={{ zIndex: 1000, elevation: 1 }}>
          <Text style={styles.sectionTitle}>Afternoon</Text>
          <DropDownPicker
            items={times.filter(t => t.value === 'afternoon')}
            open={openTimePicker}
            setOpen={setOpenTimePicker}
            value={selectedTime}
            setValue={setSelectedTime}
            placeholder="Select a time"
            containerStyle={styles.dropdown}
          />
          <ScrollView style={styles.recipeList}>
            {recipes.map(recipe => (
              <TouchableOpacity 
                key={recipe.value} 
                style={[styles.recipeItem, selectedRecipe === recipe.value && styles.selectedRecipe]} 
                onPress={() => {
                  setSelectedRecipe(recipe.value);
                  setShowDinner(true); // Show dinner section after afternoon selection
                }}>
                <Text style={styles.recipeText}>{recipe.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Save Button */}
      {showDinner && (
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: { padding: 10, marginBottom: 10 },
  backText: { fontSize: 16, color: 'black' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  dropdown: { marginBottom: 15, zIndex: 1000 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  recipeList: { marginTop: 10 },
  recipeItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ddd' },
  selectedRecipe: { backgroundColor: '#d0f0c0' },
  recipeText: { fontSize: 16 },
  saveButton: { marginTop: 20, backgroundColor: 'green', padding: 10, borderRadius: 5, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AddDayScreen;