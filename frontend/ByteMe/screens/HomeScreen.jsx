import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, ImageBackground, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const [showWeekView, setShowWeekView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      const calendarRes = await axiosInstance.get(`/api/users/${userId}/saved-days`);
      const savedDays = calendarRes.data.savedDays || [];

      const today = new Date();
      const weekMap = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        weekMap[date.toDateString()] = [];
      }

      savedDays.forEach((day) => {
        const formatted = new Date(day.date).toDateString();
        if (weekMap.hasOwnProperty(formatted)) {
          weekMap[formatted] = day.meals || [];
        }
      });

      setWeekMeals(weekMap);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load calendar data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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

  const todayDateString = new Date().toDateString();

  const getTotalCaloriesLeft = (meals, completed) => {
    const sum = meals.reduce((total, meal, idx) => {
      if (!completed?.[idx]) {
        return total + (meal.calories || 0);
      }
      return total;
    }, 0);
    return Math.round(sum); // ✅ round total calories
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome */}
      <View style={[styles.welcomeContainer, { borderBottomWidth: 1, borderBottomColor: 'gray' }]}>
        <Text style={styles.welcomeMessage}>
          Welcome{userName ? `, ${userName}` : ''}!
        </Text>
      </View>

      {/* Recipes You May Like */}
      <Text style={styles.sectionTitle}>Recipes you may like</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRecipeList}>
        {[1, 2, 3, 4].map((id) => (
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

      {/* Meal Plan for Today */}
      <Text style={styles.sectionTitle}>Meal Plan for Today</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.mealPlanContainer}>
          {/* Meals */}
          {weekMeals[todayDateString]?.length > 0 ? (
            weekMeals[todayDateString].map((meal, index) => (
              <TouchableOpacity key={index} style={styles.mealItemCard} onPress={() => handleMealPress(meal)}>
                <TouchableOpacity
                  style={[
                    styles.checkCircle,
                    completedMeals[todayDateString]?.[index] && { backgroundColor: '#1F508F', borderColor: '#1F508F' }
                  ]}
                  onPress={() => handleToggleComplete(todayDateString, index)}
                >
                  {completedMeals[todayDateString]?.[index] && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>

                <Text style={styles.mealTime}>{meal.time}</Text>

                <View style={styles.mealDetails}>
                  <Text style={[
                    styles.mealRecipeName,
                    completedMeals[todayDateString]?.[index] && { textDecorationLine: 'line-through', color: 'gray' }
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
          ) : (
            <Text style={styles.noMealText}>No meals scheduled for today.</Text>
          )}

          {/* ✅ Total Calories */}
          <View style={styles.totalCaloriesContainer}>
            <Text style={styles.totalCaloriesText}>
              Total Calories: {getTotalCaloriesLeft(weekMeals[todayDateString] || [], completedMeals[todayDateString])}
            </Text>
          </View>
        </View>
      )}

      {/* View Full Week Button */}
      <TouchableOpacity onPress={() => setShowWeekView(!showWeekView)} style={styles.viewWeekButton}>
        <Text style={styles.viewWeekButtonText}>{showWeekView ? "Hide Week" : "View Full Week"}</Text>
      </TouchableOpacity>

      {/* Full Week View */}
      {showWeekView && (
        Object.entries(weekMeals)
          .filter(([day, meals]) => meals.length > 0 && day !== todayDateString)
          .map(([day, meals]) => (
            <View key={day} style={styles.mealPlanContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {meals.map((meal, idx) => (
                <TouchableOpacity key={idx} style={styles.mealItemCard} onPress={() => handleMealPress(meal)}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.mealDetails}>
                    <Text style={styles.mealRecipeName}>{meal.recipeLabel}</Text>
                    <Text style={styles.mealCalories}>
                      {meal.calories ? `${Math.round(meal.calories)} Calories` : 'No calorie info'}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={22} color="#333" />
                </TouchableOpacity>
              ))}
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
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F508F' },
  noMealText: { textAlign: 'center', marginVertical: 10, color: textcolors.darkgrey },
  mealItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 15, marginTop: 8, borderWidth: 1, borderColor: colors.othergrey },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#1F508F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  mealTime: { fontSize: 14, fontWeight: 'bold', width: 70, marginRight: 10, color: textcolors.darkgrey },
  mealDetails: { flex: 1 },
  mealRecipeName: { fontSize: 16, fontWeight: 'bold', color: textcolors.black },
  mealCalories: { fontSize: 13, color: textcolors.darkgrey },
  totalCaloriesContainer: { borderTopWidth: 1, borderTopColor: colors.othergrey, marginTop: 10, paddingTop: 10, alignItems: 'flex-end' },
  totalCaloriesText: { fontSize: 14, fontWeight: 'bold', fontFamily: fonts.bold, color: textcolors.darkgrey },
  viewWeekButton: { backgroundColor: '#1F508F', borderRadius: 20, padding: 10, marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  viewWeekButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default HomeScreen;
