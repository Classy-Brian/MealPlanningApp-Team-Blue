import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import EditIcon from '@/assets/images/edit.png';
import { Ionicons } from '@expo/vector-icons';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedDays, setSavedDays] = useState([]);

  // ✅ Use local date to avoid timezone shift
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day); // local
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getLocalDateFromISO = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return new Date(year, month - 1, day); // Force local midnight
  };

  useEffect(() => {
    const fetchSavedDays = async () => {
      try {
        const userId = await getUserIdFromToken();
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/saved-days`);
        setSavedDays(res.data.savedDays || []);
      } catch (error) {
        console.error('Failed to load saved days:', error);
      }
    };
    fetchSavedDays();
  }, []);

  const deleteDay = async (dateToDelete) => {
    try {
      const userId = await getUserIdFromToken();
      await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/delete-day`, {
        data: { date: dateToDelete }
      });
      setSavedDays(prev => prev.filter(day => formatDate(day.date) !== formatDate(dateToDelete)));
      Alert.alert("Deleted", "Day removed from calendar.");
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Could not delete day.");
    }
  };

  const getLocalTodayString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  const markedDates = (() => {
    const today = getLocalTodayString();

    const marks = savedDays.reduce((acc, day) => {
      const formatted = formatDate(day.date);
      acc[formatted] = {
        marked: true,
        dotColor: '#4CAF50',
        ...(selectedDate === formatted && {
          selected: true,
          selectedColor: '#133E7C',
          selectedTextColor: '#fff',
        }),
      };
      return acc;
    }, {});

    if (!marks[today]) {
      marks[today] = {
        customStyles: {
          container: {
            backgroundColor: '#1F508F',
            borderRadius: 50,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        }
      };
    }

    return marks;
  })();

  const displayedDays = selectedDate
    ? savedDays.filter(d => formatDate(d.date) === selectedDate)
    : savedDays;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="custom"
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
        {displayedDays.map((day, index) => {
          const formattedDate = getLocalDateFromISO(day.date); // ✅ use local time
          const dayOfWeek = formattedDate.toLocaleDateString('en-US', { weekday: 'long' });
          const monthDay = formattedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

          const mealList = day.meals.map((m, i) => (
            <View key={i} style={[styles.mealRow, i < day.meals.length - 1 && styles.mealRowBorder]}>
              <View style={styles.mealBox}>
                <Text style={styles.mealText}>{m.recipeLabel || m.recipeId}</Text>
              </View>
            </View>
          ));

          const totalCalories = day.totalCalories ?? day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <React.Fragment key={index}>
              <View style={styles.card}>
                {/* Edit Button */}
                <TouchableOpacity
                  style={styles.editIconWrapper}
                  onPress={() =>
                    navigation.navigate('addday', {
                      editing: true,
                      existingDate: formatDate(day.date),
                      existingMeals: day.meals,
                    })
                  }
                >
                  <Image source={EditIcon} style={styles.editIcon} />
                </TouchableOpacity>

                <View style={styles.cardRow}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{dayOfWeek}</Text>
                    <Text style={styles.dateNumber}>{monthDay}</Text>
                  </View>

                  <View style={styles.verticalDivider} />

                  <View style={styles.cardContent}>{mealList}</View>
                </View>

                {/* Trash Icon */}
                <View style={styles.trashWrapper}>
                  <TouchableOpacity onPress={() => deleteDay(formatDate(day.date))}>
                    <Ionicons name="trash" size={24} color="#d00" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footerBox}>
                <Text style={styles.footerText}>
                  Total Calories: {totalCalories.toLocaleString()}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('addday')}
      >
        <Ionicons name="add" size={60} color="#d9d9d9" />
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
    borderRadius: 15,
    padding: 10,
    marginBottom: 0,
    position: 'relative',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateBox: {
    backgroundColor: '#b4c9f0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#ccc',
    height: '100%',
    marginHorizontal: 10,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 5,
    paddingRight: 25,
  },
  mealRow: {
    paddingVertical: 10,
  },
  mealRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  mealBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  mealText: {
    color: '#1F508F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#b4c9f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  footerText: {
    fontWeight: 'bold',
    color: '#1F508F',
  },
  editIconWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  trashWrapper: {
    marginTop: 10,
    alignItems: 'flex-end',
    paddingRight: 10,
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
});

export default CalendarScreen;
