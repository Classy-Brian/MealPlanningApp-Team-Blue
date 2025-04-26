import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert,
  ImageBackground, TouchableOpacity, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  const [userName, setUserName] = useState(null);
  const [token, setToken] = useState(null);
  const [axiosInstance, setAxiosInstance] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [completedMeals, setCompletedMeals] = useState({});
  const router = useRouter();

  useEffect(() => {
    const getTokenAndSetupAxios = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          setAxiosInstance(() => axios.create({
            baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
            headers: { Authorization: `Bearer ${storedToken}` },
          }));
        } else {
          router.replace('/(start)/login');
        }
      } catch (error) {
        console.error("Error getting token:", error);
        Alert.alert("Error", "Could not load authentication token.");
      }
    };
    getTokenAndSetupAxios();
  }, []);

  useEffect(() => {
    if (axiosInstance) fetchUserProfile();
  }, [axiosInstance]);

  useEffect(() => {
    if (axiosInstance) fetchTodayMeals();
  }, [axiosInstance]);

  const fetchUserProfile = async () => {
    try {
      const res = await axiosInstance.get(`/api/users/profile/${token}`);
      if (res.data?.name) {
        setUserName(res.data.name);
      }
    } catch (error) {
      if (error.response?.status === 401) router.replace('/(start)/login');
    }
  };

  const fetchTodayMeals = async () => {
    try {
      const userId = await getUserIdFromToken();
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/saved-days`);
      const todayString = new Date().toDateString();

      const todayData = res.data.savedDays.find(day => {
        return new Date(day.date).toDateString() === todayString;
      });

      if (todayData) {
        setTodayMeals(todayData.meals);
      } else {
        setTodayMeals([]);
      }
    } catch (err) {
      console.error('Failed to fetch today meals', err);
    }
  };

  const handleToggleComplete = (index) => {
    setCompletedMeals(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleMealPress = (meal) => {
    router.push({
      pathname: '/homerecipedetails',
      params: {
        recipeLabel: meal.recipeLabel,
        recipeId: meal.recipeId,
        time: meal.time,
      },
    });
  };

  const handleRecipePress = (recipe) => {
    console.log('Recipe pressed:', recipe.title);
    // you can add navigate to explore details later if you want
  };

  return (
    <ScrollView style={styles_home.container}>
      {/* Welcome */}
      <View style={[styles_home.welcomeContainer, { borderBottomColor: 'gray', borderBottomWidth: 1 }]}>
        <Text style={styles_home.welcomeMessage}>
          Welcome{userName ? `, ${userName}` : ''}!
        </Text>
      </View>

      {/* Recipes You May Like */}
      <Text style={styles_home.sectionTitle}>Recipes you may like</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles_home.horizontalRecipeList}>
        {placeholderRecipes.map((recipe) => (
          <TouchableOpacity key={recipe.id} style={styles_home.recipeCard} onPress={() => handleRecipePress(recipe)}>
            <ImageBackground source={recipe.image} style={styles_home.cardImage} imageStyle={styles_home.cardImageStyle}>
              <View style={styles_home.cardTextOverlay}>
                <Text style={styles_home.cardTitle}>{recipe.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Discover More Button */}
      <TouchableOpacity style={styles_home.discoverButton} onPress={() => router.push('/explorerecipes')}>
        <Text style={styles_home.discoverButtonText}>Discover more</Text>
      </TouchableOpacity>

      {/* Meal Plan for Today */}
      <Text style={styles_home.sectionTitle}>Meal Plan for Today</Text>

      {todayMeals.length === 0 ? (
        <Text style={{ textAlign: 'center', marginVertical: 20, color: 'gray' }}>
          No meals scheduled for today.
        </Text>
      ) : (
        <View style={styles_home.mealPlanContainer}>
          {todayMeals.map((meal, index) => (
            <TouchableOpacity key={index} style={styles_home.mealItemCard} onPress={() => handleMealPress(meal)}>
              <TouchableOpacity style={styles_home.checkCircle} onPress={() => handleToggleComplete(index)}>
                {completedMeals[index] && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>

              <Text style={styles_home.mealTime}>{meal.time}</Text>

              <View style={styles_home.mealDetails}>
                <Text style={[styles_home.mealRecipeName, completedMeals[index] && { textDecorationLine: 'line-through', color: 'gray' }]}>
                  {meal.recipeLabel}
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
});

export default HomeScreen;
