import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState(null);
  const [mealPlans, setMealPlans] = useState({});

  const { savedDate, savedMeals } = route.params || {};

  // Save passed meals into mealPlans when coming from AddDayScreen
  useEffect(() => {
    if (savedDate && savedMeals) {
      const formattedMeals = savedMeals.map(
        (m) => `${m.meal.charAt(0).toUpperCase() + m.meal.slice(1)}: ${m.time}`
      );

      setMealPlans(prev => ({
        ...prev,
        [savedDate]: formattedMeals
      }));

      setSelectedDate(savedDate); // Automatically select it
    }
  }, [savedDate, savedMeals]);

  return (
    <View style={styles.container}>
      {/* Calendar Title */}
      <Text style={styles.title}>Calendar</Text>

      {/* Calendar Component */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...(selectedDate && { [selectedDate]: { selected: true, selectedColor: "#133E7C" } }),
          ...(savedDate && { [savedDate]: { marked: true, dotColor: "#4CAF50" } })
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('addday')} // or 'addday' depending on your navigator
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
