import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Platform, Image, TextInput
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Back_butt from '@/assets/images/backbutton.png';

const AddDayScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (route.params?.selectedRecipe) {
      const { label, value, imageUri, selectedTime, selectedDate, calories } = route.params.selectedRecipe;
      const formattedTime = new Date(selectedTime).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      const formattedDate = new Date(selectedDate).toDateString();

      const newMeal = {
        label,
        value,
        time: formattedTime,
        date: formattedDate,
        image: imageUri,
        calories: Math.round(calories || 0),
        servings: 1,
        meal: 'extra'
      };

      setSelectedMeals(prev => [...prev, newMeal]);
    }
  }, [route.params?.selectedRecipe]);

  const handleSave = async () => {
    if (selectedMeals.length === 0) {
      Alert.alert("Please add at least one recipe.");
      return;
    }

    const groupedByDate = selectedMeals.reduce((acc, meal) => {
      if (!acc[meal.date]) acc[meal.date] = [];
      acc[meal.date].push({
        recipeLabel: meal.label,
        recipeId: meal.value,
        time: meal.time,
        servings: Number(meal.servings),
        meal: meal.meal,
        calories: Math.round(meal.calories || 0)
      });
      return acc;
    }, {});

    try {
      await Promise.all(Object.entries(groupedByDate).map(([date, meals]) =>
        axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
          date,
          meals,
          totalCalories: meals.reduce((sum, m) => sum + (m.calories * m.servings), 0)
        })
      ));

      Alert.alert("Saved", "Meal plans saved successfully");
      navigation.navigate('calendar');
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not save. Try again.");
    }
  };

  const removeMeal = (index) => {
    setSelectedMeals(prev => prev.filter((_, i) => i !== index));
  };

  const updateServings = (index, value) => {
    setSelectedMeals(prev => {
      const updated = [...prev];
      updated[index].servings = parseInt(value) || 1;
      return updated;
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('calendar')}>
        <Image source={Back_butt} style={styles.backIcon} />
        <Text style={styles.backText}>Calendar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Recipes to Calendar</Text>

      {/* 📅 Date Picker */}
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

      {/* 🕒 Time Picker */}
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

      {/* 🔍 Browse Button */}
      <Text style={styles.label}>Pick a Recipe</Text>
      <TouchableOpacity
        style={styles.selectRecipeButton}
        onPress={() =>
          navigation.navigate('savedrecipesdupi', {
            selectedTime,
            selectedDate
          })
        }
      >
        <Text style={styles.selectRecipeText}>Browse Saved Recipes</Text>
      </TouchableOpacity>

      {/* 🧾 Selected Meals */}
      <Text style={styles.label}>Selected Meals:</Text>
      {Object.entries(
        selectedMeals.reduce((acc, meal) => {
          if (!acc[meal.date]) acc[meal.date] = [];
          acc[meal.date].push(meal);
          return acc;
        }, {})
      ).map(([date, meals]) => (
        <View key={date} style={styles.groupBox}>
          <Text style={styles.groupDate}>{date}</Text>
          {meals.map((m, i) => {
            const globalIndex = selectedMeals.findIndex(
              sm => sm.label === m.label && sm.time === m.time && sm.date === m.date
            );
            return (
              <View key={`${m.value}-${m.time}-${i}`} style={styles.mealCard}>
                <Image source={{ uri: m.image }} style={styles.mealImage} />
                <View style={styles.mealDetails}>
                  <Text style={styles.mealText}>{m.label}</Text>
                  <Text style={styles.mealSubText}>{m.time} — {m.servings} {m.servings === 1 ? 'serving' : 'servings'}</Text>
                  <TextInput
                    style={styles.servingInput}
                    keyboardType="numeric"
                    value={String(m.servings)}
                    onChangeText={(val) => updateServings(globalIndex, val)}
                  />
                </View>
                <TouchableOpacity onPress={() => removeMeal(globalIndex)}>
                  <Ionicons name="trash" size={22} color="#d00" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ))}

      {/* ✅ Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Day</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  backButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#D7E2F1",
    padding: 10, borderRadius: 10, marginBottom: 10, alignSelf: 'flex-start',
  },
  backIcon: { width: 20, height: 20, marginRight: 5 },
  backText: { fontSize: 16, color: '#000' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  timePickerButton: {
    padding: 12, backgroundColor: '#f1f3f8', borderRadius: 8, marginTop: 5,
    alignItems: 'center', borderWidth: 1, borderColor: '#ccc'
  },
  timeText: {
    fontSize: 16, fontWeight: 'bold', color: '#1F508F'
  },
  selectRecipeButton: {
    padding: 12, backgroundColor: '#cde0fc', borderRadius: 10, alignItems: 'center',
    marginTop: 10, borderColor: '#1F508F', borderWidth: 1
  },
  selectRecipeText: {
    fontWeight: 'bold', color: '#1F508F',
  },
  groupBox: {
    backgroundColor: '#e4edff', borderRadius: 10, padding: 10, marginBottom: 10
  },
  groupDate: {
    fontSize: 16, fontWeight: 'bold', color: '#1F508F', marginBottom: 8
  },
  mealCard: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 10,
    borderRadius: 8, marginBottom: 8, alignItems: 'center'
  },
  mealImage: {
    width: 50, height: 50, borderRadius: 10, marginRight: 10
  },
  mealDetails: { flex: 1 },
  mealText: { fontWeight: 'bold', fontSize: 16, color: '#1F508F' },
  mealSubText: { fontSize: 14, color: '#555' },
  servingInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4,
    width: 60, marginTop: 4
  },
  saveButton: {
    backgroundColor: '#1F508F', padding: 15, borderRadius: 10,
    marginTop: 30, alignItems: 'center'
  },
  saveText: { color: '#fff', fontWeight: 'bold' }
});

export default AddDayScreen;
