import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [mealPlans, setMealPlans] = useState({});

  // Load saved days from backend
  useEffect(() => {
    const fetchSavedDays = async () => {
      try {
        const userId = await getUserIdFromToken();
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/saved-days`
        );

        const loadedMealPlans = {};
        response.data.savedDays.forEach(day => {
          loadedMealPlans[day.date] = day.meals.map(
            m => `${m.meal.charAt(0).toUpperCase() + m.meal.slice(1)}: ${m.time}`
          );
        });

        setMealPlans(loadedMealPlans);
      } catch (error) {
        console.error('Failed to load saved calendar days:', error);
      }
    };

    fetchSavedDays();
  }, []);

  const generateMarkedDates = () => {
    const marks = {};
    Object.keys(mealPlans).forEach((date) => {
      marks[date] = {
        marked: true,
        dotColor: '#4CAF50',
        ...(selectedDate === date && {
          selected: true,
          selectedColor: "#133E7C",
          selectedTextColor: "#fff"
        }),
      };
    });
    return marks;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={generateMarkedDates()}
        theme={{
          calendarBackground: "#fff",
          textSectionTitleColor: "#133E7C",
          selectedDayBackgroundColor: "#133E7C",
          selectedDayTextColor: "#fff",
          todayTextColor: "#133E7C",
          dayTextColor: "#000",
          textDisabledColor: "#d9e1e8",
          arrowColor: "#133E7C",
          monthTextColor: "#133E7C",
        }}
      />

      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>
          Meal Plan for {selectedDate || "Select a date"}
        </Text>
        {selectedDate && mealPlans[selectedDate] ? (
          <FlatList
            data={mealPlans[selectedDate]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.mealItem}>{item}</Text>}
          />
        ) : (
          <Text style={styles.noMealText}>No meal plan available.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddDayScreen')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#000",
  },
  mealContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  noMealText: {
    fontSize: 16,
    color: "gray",
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

export default CalendarScreen;
