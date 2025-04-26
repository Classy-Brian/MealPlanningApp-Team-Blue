import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ImageBackground, Image, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';

import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import { styles as sharedStyles } from '../components/Sheet';

const forwardButton = require('../assets/images/forwardbutton.png');
const foodImgExample = require('../assets/images/food_example.jpg');

const placeholderRecipes = [
  { id: '1', title: "Ploughman's Sandwich", image: foodImgExample },
  { id: '2', title: "Shrimp Scampi", image: foodImgExample },
  { id: '3', title: "Chicken Salad", image: foodImgExample },
  { id: '4', title: "Veggie Wrap", image: foodImgExample },
];

const HomeScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [completedMeals, setCompletedMeals] = useState({});
  const [loadingMeals, setLoadingMeals] = useState(true);

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

        const userId = userRes.data?._id;
        if (!userId) throw new Error("User ID not found.");

        const calendarRes = await axiosInstance.get(`/api/users/${userId}/saved-days`);
        const todayString = new Date().toDateString();
        const todayData = calendarRes.data.savedDays.find(day => new Date(day.date).toDateString() === todayString);

        if (todayData) {
          setTodayMeals(todayData.meals);
        } else {
          setTodayMeals([]);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error loading data", error.message || "Unknown error");
      } finally {
        setLoadingMeals(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleComplete = (index) => {
    setCompletedMeals(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleMealPress = (meal) => {
    router.push({
      pathname: '/homerecipedetails',
      params: {
        recipeLabel: meal.recipeLabel,
        recipeId: meal.recipeId,
        time: meal.time,
        imageUri: meal.imageUri || '',   // Add image
        ingredients: JSON.stringify(meal.ingredients || []),  // Pass ingredients
        allergies: JSON.stringify(meal.allergies || []),      // Pass allergies
        nutrition: JSON.stringify(meal.nutrition || {}),      // Pass nutrition
      },
    });
  };

  return (
    <ScrollView style={styles_home.container}>
      {/* Welcome */}
      <View style={[styles_home.welcomeContainer, { borderBottomWidth: 1, borderBottomColor: 'gray' }]}>
        <Text style={styles_home.welcomeMessage}>
          Welcome{userName ? `, ${userName}` : ''}!
        </Text>
      </View>

      {/* Recipes You May Like */}
      <Text style={styles_home.sectionTitle}>Recipes you may like</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles_home.horizontalRecipeList}>
        {placeholderRecipes.map((recipe) => (
          <TouchableOpacity key={recipe.id} style={styles_home.recipeCard}>
            <ImageBackground source={recipe.image} style={styles_home.cardImage} imageStyle={styles_home.cardImageStyle}>
              <View style={styles_home.cardTextOverlay}>
                <Text style={styles_home.cardTitle}>{recipe.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Discover More */}
      <TouchableOpacity style={styles_home.discoverButton} onPress={() => router.push('/explorerecipes')}>
        <Text style={styles_home.discoverButtonText}>Discover more</Text>
      </TouchableOpacity>

      {/* Meal Plan for Today */}
      <Text style={styles_home.sectionTitle}>Meal Plan for Today</Text>

      {loadingMeals ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : todayMeals.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 16, color: 'gray' }}>No meals scheduled for today!</Text>
          <TouchableOpacity style={styles_home.addMealButton} onPress={() => router.push('/addday')}>
            <Text style={styles_home.addMealButtonText}>+ Add Meal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles_home.mealPlanContainer}>
          {todayMeals.map((meal, index) => (
            <TouchableOpacity key={index} style={styles_home.mealItemCard} onPress={() => handleMealPress(meal)}>
              <TouchableOpacity style={[
                styles_home.checkCircle,
                completedMeals[index] && { backgroundColor: '#1F508F', borderColor: '#1F508F' }
              ]} onPress={() => handleToggleComplete(index)}>
                {completedMeals[index] && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>

              <Text style={styles_home.mealTime}>{meal.time}</Text>

              <View style={styles_home.mealDetails}>
                <Text style={[
                  styles_home.mealRecipeName,
                  completedMeals[index] && { textDecorationLine: 'line-through', color: 'gray' }
                ]}>
                  {meal.recipeLabel}
                </Text>
                <Text style={[
                  styles_home.mealCalories,
                  completedMeals[index] && { textDecorationLine: 'line-through', color: 'gray' }
                ]}>
                  {meal.calories ? `${Math.round(meal.calories)} Calories` : 'No calorie info'}
                </Text>
              </View>

              <Ionicons name="arrow-forward" size={22} color="#333" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles_home = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  welcomeContainer: { paddingHorizontal: 20, paddingVertical: 15, minHeight: 50 },
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
  mealPlanContainer: { marginTop: 10, paddingHorizontal: 15, backgroundColor: colors.lightgrey, paddingVertical: 10, borderRadius: 8 },
  mealItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: colors.othergrey },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#1F508F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  mealTime: { fontSize: 14, fontWeight: 'bold', color: textcolors.darkgrey, width: 70, marginRight: 15 },
  mealDetails: { flex: 1 },
  mealRecipeName: { fontSize: 16, fontWeight: 'bold', color: textcolors.black },
  mealCalories: { fontSize: 13, color: textcolors.darkgrey },
  addMealButton: { backgroundColor: '#1F508F', padding: 10, borderRadius: 20, marginTop: 10 },
  addMealButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default HomeScreen;
