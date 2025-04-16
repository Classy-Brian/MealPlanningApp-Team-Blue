import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddDayScreen = () => {
  const navigation = useNavigation();

  const [userId, setUserId] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      return d.toDateString();
    });
    setDates(next7Days);
  }, []);

  useEffect(() => {
    const fetchUserIdAndRecipes = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${id}/get-saved-recipes`);
      const formatted = res.data.savedRecipes.map((r, i) => ({
        label: r.label,
        value: r.uri || r.id || `recipe-${i}`,
        calories: r.calories || 0
      }));
      setRecipes(formatted);
      setFilteredRecipes(formatted);
    };
    fetchUserIdAndRecipes();
  }, []);

  const handleAddMeal = (recipe) => {
    if (!selectedTime) {
      Alert.alert('Please select a time first');
      return;
    }

    const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    setSelectedMeals(prev => [...prev, {
      ...recipe,
      time: formattedTime,
      meal: 'extra'
    }]);

    setSearch('');
    setFilteredRecipes(recipes);
  };

  const handleSave = async () => {
    if (!selectedDate || selectedMeals.length === 0) {
      Alert.alert("Please select a date and add at least one recipe.");
      return;
    }

    const totalCalories = selectedMeals.reduce((sum, m) => sum + m.calories, 0);

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
        date: selectedDate,
        meals: selectedMeals,
        totalCalories
      });

      Alert.alert("Saved", "Meal plan saved successfully");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save. Try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Recipes to Calendar</Text>

      <Text style={styles.label}>Pick Date</Text>
      {dates.map((date, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.dateButton, selectedDate === date && styles.dateSelected]}
          onPress={() => setSelectedDate(date)}
        >
          <Text>{date}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Select Time</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
        <Text style={styles.timeText}>
          {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={selectedTime}
          onChange={(e, time) => {
            setShowTimePicker(false);
            if (time) setSelectedTime(time);
          }}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}

      <Text style={styles.label}>Search Recipe</Text>
      <TextInput
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setFilteredRecipes(recipes.filter(r =>
            r.label.toLowerCase().includes(text.toLowerCase())
          ));
        }}
        placeholder="Search recipe..."
        style={styles.input}
      />

      {filteredRecipes.map((r, i) => (
        <TouchableOpacity key={i} onPress={() => handleAddMeal(r)} style={styles.recipeItem}>
          <Text>{r.label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Selected Meals:</Text>
      {selectedMeals.map((m, i) => (
        <Text key={i}>• {m.label} at {m.time}</Text>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Day</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5
  },
  dateButton: {
    padding: 10, borderWidth: 1, borderColor: '#1F508F', borderRadius: 8, marginTop: 5
  },
  dateSelected: {
    backgroundColor: '#cfe2f3'
  },
  recipeItem: {
    padding: 10, borderBottomWidth: 1, borderColor: '#eee'
  },
  timePickerButton: {
    padding: 12,
    backgroundColor: '#f1f3f8',
    borderRadius: 8,
    marginTop: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc'
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F508F'
  },
  saveButton: {
    backgroundColor: '#1F508F',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default AddDayScreen;
