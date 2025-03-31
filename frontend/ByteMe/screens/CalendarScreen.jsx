import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const router = useRouter();
  
  // Track selected date
  const [selectedDate, setSelectedDate] = useState(null);

  // Sample meal plan data
  const mealPlans = {
    "2025-04-01": ["Breakfast: Oatmeal", "Lunch: Chicken Salad", "Dinner: Pasta"],
    "2025-04-02": ["Breakfast: Pancakes", "Lunch: Sushi", "Dinner: Steak"],
  };

  return (
    <View style={styles.container}>
      {/* Calendar Title */}
      <Text style={styles.title}>Calendar</Text>

      {/* Calendar Component */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#133E7C" },
        }}
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

      {/* Meal Plan Section */}
      <View style={styles.mealContainer}>
        <Text style={styles.mealTitle}>Meal Plan for {selectedDate || "Select a date"}</Text>
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

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('addday')}>
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
