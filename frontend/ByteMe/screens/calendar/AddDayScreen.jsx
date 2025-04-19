import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Platform, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import Back_butt from '@/assets/images/backbutton.png';

const AddDayScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedMeals, setSelectedMeals] = useState([]);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // Receive recipe from savedrecipesdupi
  useEffect(() => {
    if (route.params?.selectedRecipe) {
      const { label, value, calories } = route.params.selectedRecipe;
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      setSelectedMeals(prev => [...prev, {
        label,
        value,
        calories,
        time: formattedTime,
        meal: 'extra'
      }]);
    }
  }, [route.params?.selectedRecipe]);

  const handleSave = async () => {
    if (!selectedDate || selectedMeals.length === 0) {
      Alert.alert("Please select a date and at least one recipe.");
      return;
    }

    const totalCalories = selectedMeals.reduce((sum, m) => sum + m.calories, 0);

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
        date: selectedDate.toDateString(),
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('calendar')}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Recipes to Calendar</Text>

      {/* Date Picker */}
      <Text style={styles.label}>Pick Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.timePickerButton}>
        <Text style={styles.timeText}>{selectedDate.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={selectedDate}
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}

      {/* Time Picker */}
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

      {/* Button to go to savedrecipesdupi */}
      <Text style={styles.label}>Pick a Recipe</Text>
      <TouchableOpacity
        style={styles.selectRecipeButton}
        onPress={() => navigation.navigate('savedrecipesdupi', {
          selectedTime: selectedTime
        })}
      >
        <Text style={styles.selectRecipeText}>Browse Saved Recipes</Text>
      </TouchableOpacity>

      {/* Selected Meals */}
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
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
  selectRecipeButton: {
    padding: 12,
    backgroundColor: '#cde0fc',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderColor: '#1F508F',
    borderWidth: 1
  },
  selectRecipeText: {
    fontWeight: 'bold',
    color: '#1F508F',
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
