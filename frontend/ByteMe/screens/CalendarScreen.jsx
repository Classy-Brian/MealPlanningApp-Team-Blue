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
import { SafeAreaView } from 'react-native-safe-area-context';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [savedDays, setSavedDays] = useState([]);

  useEffect(() => {
    const fetchSavedDays = async () => {
      console.log(`WorkspaceDATA called on CalendarScreen`);
      try {
        const userId = await getUserIdFromToken();
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/saved-days`);
        console.log(`WorkspaceDATA setting savedDays on CalendarScreen:`, res.data.savedDays);
        setSavedDays(res.data.savedDays || []);
      } catch (error) {
        console.error('Failed to load saved days:', error);
      }
    };
    fetchSavedDays();
  }, []);

  const deleteDay = async (dateStringToDelete) => {
    try {
      const userId = await getUserIdFromToken();
      await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/delete-day`, {
        data: { date: dateStringToDelete }
      });
      setSavedDays(prevSavedDays =>
        prevSavedDays.filter(day => day.date !== dateStringToDelete)
      );
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
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0); 
    const todayStrYYYYMMDD = todayObj.toISOString().split('T')[0];

    const marks = {};

    savedDays.forEach(day => {
      try {
          const dateObj = new Date(day.date);
          if (isNaN(dateObj.getTime())) {
             console.warn(`Could not parse date for marking: ${day.date}`);
             return;
          }
          const formattedYYYYMMDD = dateObj.toISOString().split('T')[0];
          marks[formattedYYYYMMDD] = {
            marked: true,
            dotColor: '#4CAF50',
          };
      } catch (e) {
          console.error(`Error processing date ${day.date} for markedDates:`, e);
      }
    });

     const todayMarking = marks[todayStrYYYYMMDD] || {};
     marks[todayStrYYYYMMDD] = {
          ...todayMarking,
          customStyles: {
              container: {
                  backgroundColor: '#D7E2F1',
                  borderRadius: 16,
                  // borderWidth: 1, borderColor: '#1F508F' // Optional border
               },
              text: {
                  color: '#1F508F',
                  fontWeight: 'bold',
              },
          }
     };

     if (selectedDate) {
          const selectedMarking = marks[selectedDate] || {};
          marks[selectedDate] = {
              ...selectedMarking,
              selected: true,
              selectedColor: '#133E7C',
              // selectedTextColor: '#FFFFFF', // Usually handled by selectedColor, but can force if needed
              customStyles: {
                 ...(selectedMarking.customStyles || {}),
                 text: {
                     ...(selectedMarking.customStyles?.text || {}),
                     color: '#FFFFFF'
                 }
              }
          };
          if (selectedDate === todayStrYYYYMMDD && marks[selectedDate].customStyles) {
               marks[selectedDate].customStyles.container = {
                 ...(marks[selectedDate].customStyles.container || {}),
                  backgroundColor: '#133E7C'
               };
          }
     }

    // console.log('Final markedDates object:', JSON.stringify(marks, null, 2));
    return marks;
  })();


  const displayedDays = selectedDate
    ? savedDays.filter(d => d.date === selectedDate)
    : savedDays;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        onDayPress={(day) => {
          // console.log('Calendar day pressed:', day);
          setSelectedDate(prevSelectedDate => {
              if (prevSelectedDate === day.dateString) {
                  // console.log('Deselecting date:', day.dateString);
                  return null;
              } else {
                  // console.log('Selecting date:', day.dateString);
                  return day.dateString;
              }
          });
        }}
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
         try {
             const [year, month, dayOfMonth] = day.date.split('-');
             const dateObject = new Date(year, parseInt(month) - 1, dayOfMonth);

             if (isNaN(dateObject.getTime())) {
                 console.error(`!!! INVALID DATE OBJECT parsed from string: ${day.date}`);
                 return null;
             }

             const dayOfWeek = dateObject.toLocaleDateString('en-US', { weekday: 'long' });
             const monthDay = dateObject.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
             const yyyyMMdd = day.date;

             const mealList = day.meals.map((m, i) => (
               <View key={`${day.date}-meal-${i}`} style={[styles.mealRow, i < day.meals.length - 1 && styles.mealRowBorder]}>
                 <View style={styles.mealBox}>
                   <Text style={styles.mealText}>{m.recipeLabel || m.recipeId || 'Unknown Meal'}</Text>
                 </View>
               </View>
             ));

             const totalCalories = day.totalCalories ?? day.meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);

             return (
               <React.Fragment key={yyyyMMdd}>
                 <View style={styles.card}>
                   {/* Edit Button - Pass 'YYYY-MM-DD' */}
                   <TouchableOpacity
                     style={styles.editIconWrapper}
                     onPress={() =>
                       navigation.navigate('addday', {
                         editing: true,
                         existingDate: yyyyMMdd,
                         existingMeals: day.meals,
                       })
                     }
                   >
                     <Image source={EditIcon} style={styles.editIcon} />
                   </TouchableOpacity>

                   {/* Card Row */}
                   <View style={styles.cardRow}>
                     <View style={styles.dateBox}>
                       {/* Display formatted local date */}
                       <Text style={styles.dateDay}>{dayOfWeek}</Text>
                       <Text style={styles.dateNumber}>{monthDay}</Text>
                     </View>
                     <View style={styles.verticalDivider} />
                     {/* Render the list of meals */}
                     <View style={styles.cardContent}>{mealList}</View>
                   </View>

                   {/* Trash Icon - Pass 'YYYY-MM-DD' */}
                   <View style={styles.trashWrapper}>
                     {/* Ensure deleteDay function expects 'YYYY-MM-DD' */}
                     <TouchableOpacity onPress={() => deleteDay(yyyyMMdd)}>
                       <Ionicons name="trash" size={24} color="#d00" />
                     </TouchableOpacity>
                   </View>
                 </View>

                 {/* Footer Box */}
                 <View style={styles.footerBox}>
                   <Text style={styles.footerText}>
                     Total Calories: {totalCalories.toLocaleString()}
                   </Text>
                 </View>
               </React.Fragment>
             );

         } catch (e) {
             console.error(`Error rendering day card for date: ${day.date}`, e);
             return <Text key={`error-${index}`}>Error displaying day: {day.date}</Text>;
         }
       })}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('addday')}
      >
        <Ionicons name="add" size={60} color="#d9d9d9" />
      </TouchableOpacity>
    </SafeAreaView>
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
