import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';

import EditIcon from '@/assets/images/edit.png';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedDays, setSavedDays] = useState([]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  useEffect(() => {
    const fetchSavedDays = async () => {
      try {
        const userId = await getUserIdFromToken();
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/saved-days`);
        setSavedDays(res.data.savedDays);
      } catch (error) {
        console.error('Failed to load saved days:', error);
      }
    };
    fetchSavedDays();
  }, []);

  const markedDates = savedDays.reduce((acc, day) => {
    const formatted = formatDate(day.date);
    acc[formatted] = {
      marked: true,
      dotColor: '#4CAF50',
      ...(selectedDate === formatted && {
        selected: true,
        selectedColor: '#133E7C',
        selectedTextColor: '#fff',
      })
    };
    return acc;
  }, {});

  const displayedDays = selectedDate
    ? savedDays.filter(d => formatDate(d.date) === selectedDate)
    : savedDays;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
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

      <ScrollView style={styles.cardsContainer}>
        {displayedDays.length === 0 ? (
          <Text style={styles.noMealText}>No meals saved for this day.</Text>
        ) : (
          displayedDays.map((day, index) => {
            const mealList = day.meals.map(m => (
              <View key={m.time} style={styles.mealBox}>
                <Text style={styles.mealText}>{m.recipeId}</Text>
              </View>
            ));

            // Optional total calories logic if you store it
            const totalCalories = day.meals.length * 500; // Replace with real calc later

            return (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
                    <Text style={styles.dateNumber}>{new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</Text>
                  </View>
                  <TouchableOpacity onPress={() => navigation.navigate('AddDayScreen')}>
                    <Image source={EditIcon} style={styles.editIcon} />
                  </TouchableOpacity>
                </View>
                {mealList}
                <View style={styles.footerBox}>
                  <Text style={styles.footerText}>Total Calories: {totalCalories.toLocaleString()}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#000' },
  cardsContainer: { marginTop: 20 },
  card: {
    backgroundColor: '#e5efff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: '#b4c9f0',
    borderRadius: 10,
    padding: 10,
  },
  dateDay: {
    fontSize: 16,
    color: '#1F508F',
    fontWeight: 'bold',
  },
  dateNumber: {
    fontSize: 18,
    color: '#1F508F',
    fontWeight: 'bold',
  },
  mealBox: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  mealText: {
    color: '#1F508F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerBox: {
    marginTop: 15,
    backgroundColor: '#b4c9f0',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  footerText: {
    fontWeight: 'bold',
    color: '#1F508F',
  },
  noMealText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 40,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F508F',
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
  },
});

export default CalendarScreen;
