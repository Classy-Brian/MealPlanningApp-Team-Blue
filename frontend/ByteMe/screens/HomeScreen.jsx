import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, ImageBackground, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';

const forwardButton = require('../assets/images/forwardbutton.png');
const foodImgExample = require('../assets/images/food_example.jpg');

const HomeScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState(null);
  const [weekMeals, setWeekMeals] = useState({});
  const [completedMeals, setCompletedMeals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          router.replace('/(start)/login');
          return;
        }

        const axiosInstance = axios.create({
          baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRes = await axiosInstance.get(`/api/users/profile/${token}`);
        if (userRes.data?.name) setUserName(userRes.data.name);

        const userId = userRes.data._id;
        if (!userId) throw new Error('User ID not found.');

        const calendarRes = await axiosInstance.get(`/api/users/${userId}/saved-days`);
        const savedDays = calendarRes.data.savedDays || [];

        // Build today + next 6 days
        const weekMap = {};
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          weekMap[date.toDateString()] = [];
        }

        savedDays.forEach((day) => {
          const formatted = new Date(day.date).toDateString();
          if (weekMap.hasOwnProperty(formatted)) {
            weekMap[formatted] = day.meals;
          }
        });

        setWeekMeals(weekMap);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load calendar data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleComplete = (day, index) => {
    setCompletedMeals((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [index]: !prev[day]?.[index],
      },
    }));
  };

  const handleMealPress = (meal) => {
    router.push({
      pathname: '/homerecipedetails',
      params: {
        recipeLabel: meal.recipeLabel,
        recipeId: meal.recipeId,
        time: meal.time,
        imageUri: meal.imageUri || '',
        ingredients: JSON.stringify(meal.ingredients || []),
        allergies: JSON.stringify(meal.allergies || []),
        nutrition: JSON.stringify(meal.nutrition || {}),
      },
    });
  };

  const getTotalCaloriesLeft = (meals, completed) => {
    return meals.reduce((sum, meal, idx) => {
      if (!completed?.[idx]) {
        return sum + (meal.calories || 0);
      }
      return sum;
    }, 0);
  };

  const todayDateString = new Date().toDateString();

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Message */}
      <View style={[styles.welcomeContainer, { borderBottomWidth: 1, borderBottomColor: 'gray' }]}>
        <Text style={styles.welcomeMessage}>
          Welcome{userName ? `, ${userName}` : ''}!
        </Text>
      </View>

      {/* Recipes You May Like */}
      <Text style={styles.sectionTitle}>Recipes you may like</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRecipeList}>
        {[1,2,3,4].map((id) => (
          <TouchableOpacity key={id} style={styles.recipeCard}>
            <ImageBackground source={foodImgExample} style={styles.cardImage} imageStyle={styles.cardImageStyle}>
              <View style={styles.cardTextOverlay}>
                <Text style={styles.cardTitle}>Example Recipe {id}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Discover More */}
      <TouchableOpacity style={styles.discoverButton} onPress={() => router.push('/explorerecipes')}>
        <Text style={styles.discoverButtonText}>Discover more</Text>
      </TouchableOpacity>

      {/* Weekly Meal Plan */}
      <Text style={styles.sectionTitle}>Your Meal Plan (Today + Next 6 Days)</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        Object.entries(weekMeals).map(([day, meals]) => (
          <View key={day} style={styles.mealPlanContainer}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {day === todayDateString ? 'Today' : day}
              </Text>
              <Text style={styles.totalCalories}>
                {getTotalCaloriesLeft(meals, completedMeals[day])} Calories
              </Text>
            </View>

            {meals.length === 0 ? (
              <Text style={styles.noMealText}>No meals scheduled</Text>
            ) : (
              meals.map((meal, index) => (
                <TouchableOpacity key={index} style={styles.mealItemCard} onPress={() => handleMealPress(meal)}>
                  <TouchableOpacity
                    style={[
                      styles.checkCircle,
                      completedMeals[day]?.[index] && { backgroundColor: '#1F508F', borderColor: '#1F508F' }
                    ]}
                    onPress={() => handleToggleComplete(day, index)}
                  >
                    {completedMeals[day]?.[index] && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.mealTime}>{meal.time}</Text>

                  <View style={styles.mealDetails}>
                    <Text style={[
                      styles.mealRecipeName,
                      completedMeals[day]?.[index] && { textDecorationLine: 'line-through', color: 'gray' }
                    ]}>
                      {meal.recipeLabel}
                    </Text>
                    <Text style={styles.mealCalories}>
                      {meal.calories ? `${Math.round(meal.calories)} Calories` : 'No calorie info'}
                    </Text>
                  </View>

                  <Ionicons name="arrow-forward" size={22} color="#333" />
                </TouchableOpacity>
              ))
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  welcomeContainer: { paddingHorizontal: 20, paddingVertical: 15 },
  welcomeMessage: { fontSize: 30, fontWeight: 'bold', color: textcolors.black },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 10 },
  horizontalRecipeList: { paddingHorizontal: 15, paddingVertical: 10 },
  recipeCard: { width: 250, height: 160, borderRadius: 10, overflow: 'hidden', marginRight: 15 },
  cardImage: { flex: 1, justifyContent: 'flex-end' },
  cardImageStyle: { borderRadius: 10 },
  cardTextOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  discoverButton: { backgroundColor: colors.othergrey, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'center', marginTop: 10, marginBottom: 20 },
  discoverButtonText: { color: textcolors.black, fontSize: 16, fontWeight: 'bold' },
  mealPlanContainer: { backgroundColor: colors.lightgrey, marginBottom: 20, borderRadius: 8, padding: 10, marginHorizontal: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F508F' },
  totalCalories: { fontSize: 14, fontWeight: 'bold', color: '#1F508F' },
  noMealText: { textAlign: 'center', marginVertical: 10, color: textcolors.darkgrey },
  mealItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 15, marginTop: 8, borderWidth: 1, borderColor: colors.othergrey },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#1F508F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  mealTime: { fontSize: 14, fontWeight: 'bold', width: 70, marginRight: 10, color: textcolors.darkgrey },
  mealDetails: { flex: 1 },
  mealRecipeName: { fontSize: 16, fontWeight: 'bold', color: textcolors.black },
  mealCalories: { fontSize: 13, color: textcolors.darkgrey },
});

export default HomeScreen;
