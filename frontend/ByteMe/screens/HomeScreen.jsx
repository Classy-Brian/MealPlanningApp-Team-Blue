import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, ImageBackground, RefreshControl, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter, useFocusEffect } from 'expo-router';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { Ionicons } from '@expo/vector-icons';
import { usePantry } from '@/components/PantryContext';

import { colors } from '../components/Colors';
import { textcolors } from '../components/TextColors';
import { fonts } from '../components/Fonts';
import { useNavigation } from '@react-navigation/native';

const forwardButton = require('../assets/images/forwardbutton.png');
const foodImgExample = require('../assets/images/food_example.jpg');

const getYYYYMMDD = (date) => date.toISOString().split('T')[0];

const HomeScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [userName, setUserName] = useState(null);
  const [weekMeals, setWeekMeals] = useState({});
  const [completedMeals, setCompletedMeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showWeekView, setShowWeekView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [axiosInstance, setAxiosInstance] = useState(null);
  const [token, setToken] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [todayYYYYMMDD, setTodayYYYYMMDD] = useState(getYYYYMMDD(new Date()));


  // console.log("--- Rendering HomeScreen ---");
  // console.log("Current mealPlan state:", mealPlan);
  // console.log("Current isLoading state:", isLoading);
  // console.log("Current error state:", error);
  const { suggestions: pantrySuggestions, loading: pantryLoading, reloadSuggestions } = usePantry();

  useEffect(() => {
    const getTokenAndSetupAxios = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!storedToken) {
          setUserName(null);
          router.replace('/(start)/login');
          return;
        }
        setToken(storedToken);
        const axiosInst = axios.create({
          baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setAxiosInstance(axiosInst);

        const userId = await getUserIdFromToken(storedToken);
        setUserId(userId);

        const userRes = await axiosInst.get(`/api/users/profile`);

        setUserName(userRes.data?.name || null);

        const calendarRes = await axiosInst.get(`/api/users/${userId}/saved-days`);
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
        await reloadSuggestions();
      } catch (error) {
        console.error("Error setting up token and axios:", error);
        Alert.alert("Error", "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    getTokenAndSetupAxios();
  }, []);

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

      let fetchedUserId = null;

      if (userRes.data?._id) {
        // const userId = userRes.data._id;
        fetchedUserId = userRes.data._id;
        
        setUserId(fetchedUserId);
        // console.log("Stored userId farom profile fetch:", fetchedUserId);

        if (userRes.data?.name) {
          setUserName(userRes.data.name);
        } else {
          setUserName(null);
        }

        // console.log(`Workspaceing saved days for user: ${fetchedUserId}`);
        const calendarRes = await axiosInstance.get(`/api/users/${fetchedUserId}/saved-days`);
        const savedDays = calendarRes.data.savedDays || [];
        // console.log("fetchData - Raw savedDays from API:", JSON.stringify(savedDays, null, 2));

        const todayObj = new Date();
        const weekMap = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(todayObj);
          date.setDate(todayObj.getDate() + i);
          weekMap[getYYYYMMDD(date)] = [];
        }

        savedDays.forEach((day) => {
          const formattedKeyYYYYMMDD = day.date;
          if (weekMap.hasOwnProperty(formattedKeyYYYYMMDD)) {
            weekMap[formattedKeyYYYYMMDD] = day.meals || [];
          }
        });

        // console.log(`WorkspaceDATA setting weekMeals on HomeScreen:`, weekMap);
        setWeekMeals(weekMap);
      } else {
        console.error("User ID (_id) not found in profile response. Cannot load user-specific data.");
        Alert.alert("Error", "Failed to load complete user profile.");
        setUserId(null);
        setUserName(null);
        setWeekMeals({});
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
       Alert.alert('Error', 'Failed to load user data.');
       setUserId(null);
       setUserName(null);
       setWeekMeals({});
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
      let isActive = true;

      const runEffects = async () => {
        await fetchData();
        await reloadSuggestions();
      }

      if (isActive) {
        runEffects()
      }

      return () => {
        isActive = false;
      }
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const fetchAiMealPlan = async () => {
    // console.log("Frontend: Attempting to fetch AI meal plan...");
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    // if (!axiosInstance) {
    //     console.error("Frontend: Axios instance not ready.");
    //     setError("Session data is not ready. Please try again shortly.");
    //     setIsLoading(false);
    //     Alert.alert("Error", "Session data is not ready. Please try again shortly.");
    //     return;
    // }

    if (!token) {
      console.error("Frontend: Token not available for AI call (global axios test).");
      setError("Session not fully loaded. Please wait or try reloading.");
      setIsLoading(false);
      Alert.alert("Error", "Session token not found. Cannot generate plan.");
      return;
    }

    const fullApiUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/generate-structured-plan`;
    console.log("Frontend: Attempting POST to:", fullApiUrl, "using global axios with token from state.");

    try {
        // const response = await axiosInstance.post('/api/ai/generate-structured-plan');
        // // console.log("Frontend: AI Plan fetched successfully!", response.data);

        // if (response.data && response.data.generatedPlan) {
        //     setMealPlan(response.data.generatedPlan);
        //     // console.log("Frontend: setMealPlan called with data:", response.data.generatedPlan);
        // } else {
        //     console.error("Frontend: Generated plan data missing in response:", response.data);
        //     throw new Error("Received plan data in unexpected format from server.");
        // }

        const response = await axios.post(
          fullApiUrl,
          {},
          {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }
      );

      console.log("Frontend: AI Plan fetched successfully (using global axios)!", response.data);
      if (response.data && response.data.generatedPlan) {
          setMealPlan(response.data.generatedPlan);
          // console.log("Frontend: setMealPlan called with data (global axios test):", response.data.generatedPlan);
      } else {
          console.error("Frontend: Generated plan data missing in response (global axios test):", response.data);
          throw new Error("Received plan data in unexpected format from server.");
      }

    } catch (err) {
        console.error("Frontend: Error fetching AI plan:", err);
        let message = "An error occurred while generating the plan.";
        if (err.response && err.response.data && err.response.data.error) {
            message = err.response.data.error;
        } else if (err.message) {
            message = err.message;
        }
        setError(message);
        setMealPlan(null);
        Alert.alert("Plan Generation Failed", message);
    } finally {
        setIsLoading(false);
        // console.log("Frontend: Finished fetching AI meal plan attempt.");
    }
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
    // console.log("handleMealPress - Received meal object:", JSON.stringify(meal, null, 2));
    // router.push({
    //   pathname: '/homerecipedetails',
    //   params: {
    //     recipeLabel: meal.recipeLabel,
    //     recipeId: meal.recipeId,
    //     time: meal.time,
    //     imageUri: meal.imageUri || '',
    //     ingredients: JSON.stringify(meal.ingredients || []),
    //     allergies: JSON.stringify(meal.allergies || []),
    //     directions: meal.directions || '',
    //     nutrition: JSON.stringify(meal.nutrition || {}),
    //   },
    // });
    navigation.navigate('homerecipedetails', {
      recipeLabel: meal.recipeLabel,
      recipeId: meal.recipeId,
      time: meal.time,
      imageUri: meal.imageUri || '',
      ingredients: JSON.stringify(meal.ingredients || []),
      allergies: JSON.stringify(meal.allergies || []),
      directions: meal.directions || '',
      nutrition: JSON.stringify(meal.nutrition || {}),
    })
  };

  const today = new Date();
  const todayDateString = today.toDateString();

  const getTotalCaloriesLeft = (meals, completed) => {
    const sum = meals.reduce((total, meal, idx) => {
      if (!completed?.[idx]) {
        return total + (meal.calories || 0);
      }
      return total;
    }, 0);
    return Math.round(sum);
  };

  const handleSaveAiPlan = async () => {
    // console.log("Frontend: 'Save This Plan' button pressed.");

    if (!mealPlan || !userId) {
      Alert.alert("Error", "Cannot save plan. Missing plan data or user session.");
      return;
    }
    // console.log("Using userId from state for saving:", userId);

    const today = new Date();
    const dateToSave = today.toISOString().split('T')[0];
    const defaultTimes = { breakfast: "08:00 AM", lunch: "12:00 PM", dinner: "06:00 PM" };
    const servingsToSave = 1;
    let mealsToSave = [];
    let calculatedTotalCalories = 0;

    // console.log("Looping through mealPlan object...");

    for (const [mealType, mealData] of Object.entries(mealPlan)) {
      // console.log(` -> Processing mealType: ${mealType}`);
      // console.log(`    Data available:`, mealData);

      let mealObject = {
        meal: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        time: defaultTimes[mealType] || "N/A",
        servings: servingsToSave,
        recipeId: `ai_suggestion_${mealType}`,
        recipeLabel: `Suggestion for ${mealType}`,
        calories: 0,
        imageUri: null,
        ingredients: [],
        directions: '',
        allergies: [],
        nutrition: {},
      };

      // console.log(`    Initial mealObject created:`, mealObject);

      if (mealData.source === 'edamam') {
        mealObject.recipeLabel = mealData.label || "Edamam Recipe"; 
        mealObject.recipeId = mealData.uri || `edamam_missing_uri_${mealType}`;
        mealObject.calories = mealData.calories || 0;
        mealObject.imageUri = mealData.imageUrl || null;

        mealObject.directions = mealData.url || '';
        mealObject.ingredients = mealData.ingredientLines || [];
        mealObject.nutrition = mealData.totalNutrients || {};
        mealObject.allergies = mealData.healthLabels || []; 
        mealObject.url = mealData.url || null;

        // console.log(`    -> Overwrote with Edamam data.`);

      } else {
        mealObject.recipeLabel = mealData.suggestion || `AI Suggestion for ${mealType}`;
        // console.log(`    -> Using AI suggestion fallback data.`);

        mealObject.directions = '';
        mealObject.ingredients = [];
        mealObject.nutrition = {};
        mealObject.allergies = [];
        mealObject.url = null;
      }

      // console.log(`    Final mealObject for ${mealType}:`, mealObject);
      mealsToSave.push(mealObject);
    }

    // console.log("Finished looping through meals.");
    // console.log("Collected mealsToSave array:", mealsToSave);

    calculatedTotalCalories = mealsToSave.reduce((sum, meal) => {
      const mealCalories = typeof meal.calories === 'number' ? meal.calories : 0;
      const mealServings = typeof meal.servings === 'number' ? meal.servings : 1;
      return sum + (mealCalories * mealServings);
    }, 0);

    // console.log(`Calculated Total Calories for payload: ${Math.round(calculatedTotalCalories)}`);

    const payload = {
      date: dateToSave,
      meals: mealsToSave,
      totalCalories: Math.round(calculatedTotalCalories)
    };

    // console.log("Frontend: FINAL PAYLOAD object prepared:");
    // console.log(payload);
    // console.log("--- Stringified Payload (for readability) ---");
    // console.log(JSON.stringify(payload, null, 2));
    // console.log("---------------------------------------------");

    setIsSaving(true);
    setError(null);

    const fullSaveUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`;
    console.log("Frontend: Attempting POST to:", fullSaveUrl, "using global axios.");

    try {
      // console.log(`Frontend: Sending POST to /api/users/${userId}/save-day`);
      // const response = await axiosInstance.post(`/api/users/${userId}/save-day`, payload);

      const response = await axios.post( // Use global axios
        fullSaveUrl,
        payload, 
        { // Config object for headers
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
      );

      console.log("Frontend: Save successful (using global axios)!", response.data);

      // console.log("Frontend: Save successful!", response.data);
      Alert.alert("Success!", "AI meal plan saved for today!");

      // fetchData();
      // setMealPlan(null);
      console.log("Save successful, calling fetchData to refresh...");
      await fetchData();
      console.log("fetchData completed after save.");
      setMealPlan(null);
    } catch(err) {
      console.error("Frontend: Error saving AI plan:", err);

      let message = "Failed to save the plan.";
      if (err.response?.data?.message) { 
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      Alert.alert("Save Failed", message);

    } finally {
      setIsSaving(false);
      // console.log("Frontend: Finished save attempt.");
    }
  };

  // console.log("HomeScreen RENDER - todayDateString used for display:", todayDateString);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); reloadSuggestions().finally(() => setRefreshing(false)); }} />}
    >
      {/* Welcome */}
      <View style={[styles.welcomeContainer, { borderBottomWidth: 1, borderBottomColor: 'gray' }]}>
        <Text style={styles.welcomeMessage}>
          Welcome{userName ? `, ${userName}` : ''}!
        </Text>
      </View>

      {/* Pantry Suggestions */}
      <Text style={styles.sectionTitle}>Recipes you may like</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRecipeList}>
        {pantryLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : pantrySuggestions.length > 0 ? (
          pantrySuggestions.map((item, index) => {
            const recipe = item.recipe;
            return (
              <TouchableOpacity
                key={index}
                style={styles.recipeCard}
                onPress={() =>
                  navigation.navigate('pantrysuggestiondetails', {
                      recipeLabel: recipe.label,
                      recipeId: recipe.uri,
                      imageUri: recipe.image,
                      title: recipe.label,
                      ingredients: JSON.stringify(recipe.ingredientLines || []),
                      directions: recipe.url,
                      allergies: JSON.stringify(recipe.healthLabels || []),
                      nutrition: JSON.stringify(recipe.totalNutrients || {}),
                    }
                  )
                }
              >
                <ImageBackground source={{ uri: recipe.image || foodImgExample }} style={styles.cardImage} imageStyle={styles.cardImageStyle}>
                  <View style={styles.cardTextOverlay}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{recipe.label}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ paddingHorizontal: 20, color: textcolors.grey }}>
            No pantry suggestions available.
          </Text>
        )}
      </ScrollView>


      {/* AI Generate Button */}
      <TouchableOpacity
        style={localStyles.aiButton}
        onPress={fetchAiMealPlan}
        disabled={isLoading && !mealPlan}
       >
        <Text style={localStyles.aiButtonText}>
          {isLoading && !mealPlan ? "Generating Plan..." : "✨ Generate AI Plan for Today ✨"}
        </Text>
      </TouchableOpacity>

       {/* Meal Plan Display Area */}
      <Text style={styles.sectionTitle}>Meal Plan for Today</Text>

      <View style={styles.mealPlanContainer}>
        {isLoading && !mealPlan ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : error ? (
          <Text style={localStyles.errorText}>Error generating plan: {error}</Text>
        ) : mealPlan ? (
          <>
          <View>
            {Object.entries(mealPlan).map(([mealType, mealData]) => {
              // --- Render AI plan meal card ---
              let icon = mealType === 'breakfast' ? '☀️' : mealType === 'lunch' ? '🌤️' : '🌙';
              return (
                <View key={mealType}>
                  <View style={styles.mealTypeHeader}>

                    <Text style={styles.mealTypeText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                    <Text style={styles.mealTypeIcon}>{icon}</Text>

                    </View>
                      <View style={styles.mealItemCard}>
                          {mealData.source === 'edamam' ? (
                            <>
                            <Image source={{ uri: mealData.imageUrl }} style={localStyles.mealImage} />
                            <View style={styles.mealDetails}>
                              <Text style={styles.mealRecipeName} numberOfLines={2}>{mealData.label}</Text>
                              <Text style={styles.mealCalories}>~{mealData.calories} Calories / serving</Text>
                              <Text style={localStyles.mealSource}>Source: Edamam</Text>
                            </View>
                            </>
                          ) : (
                            <View style={[styles.mealDetails, { flex: 1, marginLeft: 10 }]}>
                              <Text style={styles.mealRecipeName} numberOfLines={3}>{mealData.suggestion}</Text>
                              <Text style={localStyles.mealSource}>Source: AI Suggestion</Text>
                            </View>
                          )}
                    </View>
                  </View>
              );
            })} 
          </View>

          {/* --- Save / Cancel Buttons --- */}
          <View style={localStyles.actionButtonsContainer}>
            <TouchableOpacity
              style={[localStyles.actionButton, localStyles.saveButton]}
              onPress={handleSaveAiPlan}
              disabled={isLoading || isSaving}
            >

              <Text style={localStyles.actionButtonText}>
                {isSaving ? "Saving..." : "Save This Plan"}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={[localStyles.actionButton, localStyles.cancelButton]}
                onPress={() => {
                  // console.log("Cancel Pressed! Reverting display.");
                  setMealPlan(null);
                  setError(null);
                }}
                disabled={isLoading || isSaving}
            >

              <Text style={localStyles.actionButtonText}>Cancel</Text>

            </TouchableOpacity>
          </View>
          </>

          ) : (
            <>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{marginVertical: 10}}/>
            ) : weekMeals[todayYYYYMMDD]?.length > 0 ? (
              weekMeals[todayYYYYMMDD].map((meal, index) => (

              <TouchableOpacity key={index} style={styles.mealItemCard} onPress={() => handleMealPress(meal)}>

                <TouchableOpacity
                    style={[styles.checkCircle, completedMeals[todayYYYYMMDD]?.[index] && { backgroundColor: '#1F508F', borderColor: '#1F508F' }]}
                    onPress={() => handleToggleComplete(todayYYYYMMDD, index)}
                >
                  {completedMeals[todayYYYYMMDD]?.[index] && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>

                <Text style={styles.mealTime}>{meal.time}</Text>

                <View style={styles.mealDetails}>
                  <Text style={[styles.mealRecipeName, completedMeals[todayYYYYMMDD]?.[index] && { textDecorationLine: 'line-through', color: 'gray' }]}>{meal.recipeLabel}</Text>
                  <Text style={styles.mealCalories}>{meal.calories ? `${Math.round(meal.calories)} Calories` : 'No calorie info'}</Text>
                </View>

                <Ionicons name="arrow-forward" size={22} color="#333" />

              </TouchableOpacity>
                  ))
            ) : (
              <Text style={localStyles.placeholderText}>No meals scheduled for today. Generate one?</Text>
            )}

            {/* Total Calories for saved plan */}
            {!loading && weekMeals[todayYYYYMMDD]?.length > 0 && (
                  <View style={styles.totalCaloriesContainer}>
                      <Text style={styles.totalCaloriesText}>
                          Total Calories Left: {getTotalCaloriesLeft(weekMeals[todayYYYYMMDD] || [], completedMeals[todayYYYYMMDD])}
                      </Text>
                  </View>
            )}
          </>
           )}
       </View>

      {/* View Full Week Button */}
      <TouchableOpacity onPress={() => setShowWeekView(!showWeekView)} style={styles.viewWeekButton}>
        <Text style={styles.viewWeekButtonText}>{showWeekView ? "Hide Week" : "View Full Week"}</Text>
      </TouchableOpacity>

      {/* Full Week View */}
      {showWeekView && (
        Object.entries(weekMeals)
          .filter(([day, meals]) => meals.length > 0 && day !== todayYYYYMMDD)
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

const localStyles = StyleSheet.create({
    aiButton: {
        backgroundColor: colors.header,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    aiButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    mealImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: colors.lightgrey,
    },
    mealSource: {
        fontSize: 11,
        color: textcolors.grey,
        fontStyle: 'italic',
        marginTop: 4,
    },
    placeholderText: {
        textAlign: 'center',
        marginVertical: 40,
        color: textcolors.grey,
        fontSize: 16,
        paddingHorizontal: 20,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      marginBottom: 10,
    },
    actionButton: {
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    saveButton: {
      backgroundColor: colors.header,
    },
    cancelButton: {
      backgroundColor: colors.grey,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    mealImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: colors.lightgrey, },
    mealSource: { fontSize: 11, color: textcolors.grey, fontStyle: 'italic', marginTop: 4, },
    errorText: { color: 'red', textAlign: 'center', marginVertical: 20, paddingHorizontal: 15, fontSize: 16, },
    placeholderText: { textAlign: 'center', marginVertical: 40, color: textcolors.grey, fontSize: 16, paddingHorizontal: 20, }
});

const styles_home = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    welcomeContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'flex-start',
        minHeight: 50,
    },
    welcomeMessage: {
        fontSize: 35,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    horizontalRecipeList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    recipeCard: {
        width: 250,
        height: 160,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        backgroundColor: colors.lightgrey,
    },
    cardImage: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    cardImageStyle: {
        borderRadius: 10,
    },
    cardTextOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    discoverButton: {
        backgroundColor: colors.othergrey,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20,
        marginLeft: 250
    },
    discoverButtonText: {
        color: textcolors.black,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
    },
    mealPlanContainer: {
        marginTop: 10,
        marginBottom: 30,
        paddingHorizontal: 15,
        backgroundColor: colors.lightgrey,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    mealTypeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    mealTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginRight: 8,
    },
    mealTypeIcon: {
        fontSize: 18,
    },
    mealItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.othergrey,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    mealTime: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.darkgrey,
        width: 70,
        marginRight: 15,
    },
    mealDetails: {
        flex: 1,
    },
    mealRecipeName: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.black,
        marginBottom: 3,
    },
    mealCalories: {
        fontSize: 13,
        color: textcolors.darkgrey,
        fontFamily: fonts.regular,
    },
    totalCaloriesContainer: {
        borderTopWidth: 1,
        borderTopColor: colors.othergrey,
        marginTop: 10,
        paddingTop: 10,
        alignItems: 'flex-end',
     },
    totalCaloriesText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: fonts.bold,
        color: textcolors.darkgrey,
     },
});
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
