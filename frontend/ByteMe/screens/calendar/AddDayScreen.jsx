import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, TextInput, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import backarrow from "@/assets/images/back_arrow_navigate.png"

import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/components/Sheet';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Calendar</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const AddDayScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [timePickerIndex, setTimePickerIndex] = useState(null);

  // ✅ Fix timezone bugs with this helper
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (route.params?.editing && route.params.existingMeals && route.params.existingDate) {
      const loadedMeals = route.params.existingMeals.map(meal => ({
        label: meal.recipeLabel,
        value: meal.recipeId,
        calories: Math.round(meal.calories || 0),
        image: meal.imageUri || '',
        ingredients: meal.ingredients || [],
        directions: meal.directions || '',
        allergies: meal.allergies || [],
        nutrition: meal.nutrition || {},
        time: meal.time || null,
        timeRaw: meal.time ? new Date(`${route.params.existingDate} ${meal.time}`) : null,
        date: parseLocalDate(route.params.existingDate).toDateString(), // ✅ Fix here
        servings: meal.servings || 1,
        meal: meal.meal || 'extra',
      }));

      setSelectedMeals(loadedMeals);
      setSelectedDate(parseLocalDate(route.params.existingDate)); // ✅ Fix here
    }
  }, [route.params?.editing]);

  useEffect(() => {
    if (!route.params?.editing && route.params?.selectedDate) {
      setSelectedDate(new Date(route.params.selectedDate));
    }
  }, [route.params?.selectedDate, route.params?.editing]);

  useEffect(() => {
    if (route.params?.selectedRecipes) {
      const recipes = route.params.selectedRecipes.map(recipe => ({
        label: recipe.label,
        value: recipe.uri,
        calories: Math.round(recipe.calories || 0),
        image: recipe.imageUri || '',
        ingredients: recipe.ingredients || [],
        directions: recipe.directions || '',
        allergies: recipe.allergies || [],
        nutrition: recipe.nutrition || {},
        time: null,
        timeRaw: null,
        date: new Date(recipe.selectedDate || selectedDate).toDateString(),
        servings: 1,
        meal: 'extra',
      }));

      setSelectedMeals(prev => [...prev, ...recipes]);
    }
  }, [route.params?.selectedRecipes]);

  const handleSave = async () => {
    if (selectedMeals.length === 0) {
      Alert.alert("Please add at least one meal.");
      return;
    }

    try {
      const userId = await getUserIdFromToken();

      // 🧼 Delete the old saved day if editing
      if (route.params?.editing && route.params.existingDate) {
        await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/delete-day`, {
          data: { date: route.params.existingDate }
        });
      }

      const grouped = selectedMeals.reduce((acc, meal) => {
        if (!acc[meal.date]) acc[meal.date] = [];
        acc[meal.date].push({
          recipeLabel: meal.label,
          recipeId: meal.value,
          imageUri: meal.image,
          ingredients: meal.ingredients,
          directions: meal.directions,
          allergies: meal.allergies,
          nutrition: meal.nutrition,
          calories: meal.calories,
          time: meal.time || 'Not selected',
          servings: meal.servings,
          meal: meal.meal,
        });
        return acc;
      }, {});

      await Promise.all(Object.entries(grouped).map(([date, meals]) =>
        axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
          date: new Date(date).toISOString().split('T')[0], // 🔐 Force correct format
          meals,
          totalCalories: meals.reduce((sum, m) => sum + m.calories * m.servings, 0),
        })
      ));

      Alert.alert("Saved", "Meal plans saved successfully!");
      navigation.navigate('calendar');
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save meal plan.");
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

  const openTimePicker = (index) => {
    setTimePickerIndex(index);
  };

  const onTimeChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setTimePickerIndex(null);
      return;
    }

    if (selected && timePickerIndex !== null) {
      setSelectedMeals(prev => {
        const updated = [...prev];
        updated[timePickerIndex].time = selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        updated[timePickerIndex].timeRaw = selected;

        return updated.sort((a, b) => {
          if (a.date !== b.date) return 0;
          if (!a.timeRaw || !b.timeRaw) return 0;
          return new Date(a.timeRaw) - new Date(b.timeRaw);
        });
      });
    }

    setTimePickerIndex(null);
  };

  return (
    <SafeAreaView>
        <ScrollView style={det.container}>
        {/* Back Button */}
        <BackButton />

        <Text style={styles.title}>
          {route.params?.editing ? 'Edit Recipes for Day' : 'Add Recipes to Calendar'}
        </Text>

        {/* Pick Date */}
        <View style={{marginBottom: 10}}>
          <Text style={styles.heading}>Pick Date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={det.timePickerButton}>
            <Text style={det.timeText}>{selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        
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

        {/* Browse Recipes */}
        <View style={{marginBottom: 10}}>
          <Text style={styles.heading}>Pick a Recipe</Text>
          <TouchableOpacity
            style={det.selectRecipeButton}
            onPress={() =>
              navigation.navigate('savedrecipesdupi', {
                selectedTime,
                selectedDate,
              })
            }
          >
            <Text style={det.timeText}>Browse Saved Recipes</Text>
          </TouchableOpacity>
        </View>
        

        {/* Selected Meals */}
        <View style={{marginBottom: 10}}>
            <Text style={styles.heading}>Selected Meals:</Text>

          {Object.entries(
            selectedMeals.reduce((acc, meal) => {
              if (!acc[meal.date]) acc[meal.date] = [];
              acc[meal.date].push(meal);
              return acc;
            }, {})
          ).map(([date, meals]) => (
            <View key={date} style={det.groupBox}>
              <Text style={det.groupDate}>{date}</Text>

              {meals.map((m, i) => {
                const globalIndex = selectedMeals.findIndex(
                  sm => sm.label === m.label && sm.date === m.date && sm.value === m.value
                );

                return (
                  <View key={`${m.value}-${i}`} style={det.mealCard}>
                    <Image source={{ uri: m.image }} style={det.mealImage} />
                    <View style={det.mealDetails}>
                      <Text style={det.mealText}>{m.label}</Text>

                      <View style={det.timeRow}>
                        <Text style={det.mealSubText}>
                          {m.time ? `${m.time}` : 'No time selected'}
                        </Text>

                        <TouchableOpacity style={det.pickTimeButton} onPress={() => openTimePicker(globalIndex)}>
                          <Text style={det.pickTimeButtonText}>Pick Time</Text>
                        </TouchableOpacity>
                      </View>

                      <TextInput
                        style={det.servingInput}
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
        </View>
        

        {/* Mini Time Picker */}
        {timePickerIndex !== null && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={onTimeChange}
            display="spinner"
          />
        )}

        {/* Save Button */}
        <TouchableOpacity style={det.saveButton} onPress={handleSave}>
          <Text style={[styles.regularText, {color: textcolors.white}]}>Save Day</Text>
        </TouchableOpacity>
        <View style={{marginBottom: 50}}/>
      </ScrollView>
    </SafeAreaView>
    
  );
};

const det = StyleSheet.create({
  container: { padding: 20 },
  backButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#D7E2F1", padding: 10, borderRadius: 10, marginBottom: 10, alignSelf: 'flex-start' },
  backIcon: { width: 20, height: 20, marginRight: 5 },
  backText: { fontSize: 16, color: '#000' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  timePickerButton: { padding: 12, backgroundColor: '#f1f3f8', borderRadius: 8, marginTop: 5, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  timeText: { 
    fontSize: 20, 
    color: '#1F508F',
    fontFamily: fonts.bold
   },
  selectRecipeButton: { padding: 12, backgroundColor: '#cde0fc', borderRadius: 10, alignItems: 'center', marginTop: 10, borderColor: '#1F508F', borderWidth: 1 },
  selectRecipeText: { fontWeight: 'bold', color: '#1F508F' },
  groupBox: { backgroundColor: '#e4edff', borderRadius: 10, padding: 10, marginBottom: 10 },
  groupDate: { fontSize: 18, fontFamily: fonts.bold, color: '#1F508F', marginBottom: 8 },
  mealCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  mealImage: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  mealDetails: { flex: 1 },
  mealText: { fontFamily: fonts.bold, fontSize: 18, color: '#1F508F' },
  mealSubText: { fontSize: 16, fontFamily: fonts.regular, color: '#555' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  pickTimeButton: { backgroundColor: '#1F508F', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginLeft: 10 },
  pickTimeButtonText: { color: '#fff', fontSize: 14, fontFamily: fonts.regular },
  servingInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 60, marginTop: 6 },
  saveButton: { backgroundColor: '#1F508F', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});

export default AddDayScreen;
