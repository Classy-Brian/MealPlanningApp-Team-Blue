// START OF FILE
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { styles as globalStyles } from '@/components/Sheet';
import backarrow from '@/assets/images/back_arrow_navigate.png';

const screenWidth = Dimensions.get('window').width;

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={localStyles.backButtonContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={globalStyles.greybutton}>
          <Image source={backarrow} style={localStyles.backArrow} />
          <Text style={globalStyles.regularText}>Back</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function ChatBot() {
  const [mealPlans, setMealPlans] = useState([]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! You can chat with me or type "generate meal plan" to get started.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [savingSingle, setSavingSingle] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [savedSingle, setSavedSingle] = useState(false);
  const [savedAll, setSavedAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const scrollRef = useRef();
  const inputRef = useRef(); 
  const [typingAnimation, setTypingAnimation] = useState(null);
  

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const fetchRecipeDetails = async (uri) => {
    const id = uri.split('#recipe_')[1];
    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    const res = await axios.get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${API_ID}&app_key=${API_KEY}`);
    return res.data.recipe;
  };

  const fetchAnotherRecipe = async (mealType) => {
    const cleanMealType = mealType.toLowerCase().includes('lunch') ? 'Lunch' :
                          mealType.toLowerCase().includes('dinner') ? 'Dinner' :
                          mealType.toLowerCase().includes('breakfast') ? 'Breakfast' : 'Lunch';

    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${cleanMealType}&app_id=${API_ID}&app_key=${API_KEY}&mealType=${cleanMealType}&random=true`;

    const res = await axios.get(url);
    const hits = res.data.hits;
    if (hits.length === 0) throw new Error('No new recipe found.');
    return hits[0].recipe;
  };

  const saveRecipe = async (recipe) => {
    try {
      setSavingSingle(true);
      const userId = await getUserIdFromToken();
      const recipeId = recipe.uri;
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`, { userId, recipeId });
      Alert.alert("Success", "Recipe saved successfully!");
      setSavedSingle(true);
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert("Error", "Could not save recipe.");
    } finally {
      setSavingSingle(false);
    }
  };

  const saveAllRecipes = async () => {
    try {
      setSavingAll(true);
      setSavedAll(false);
      const userId = await getUserIdFromToken();
      const allRecipes = mealPlans.flatMap(day => [day.breakfast, day.lunch, day.dinner]).filter(Boolean);
      for (const recipe of allRecipes) {
        await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`, { userId, recipeId: recipe.uri });
      }
      setSavedAll(true);
    } catch (err) {
      console.error("Save all error:", err);
      Alert.alert("Error", "Could not save all recipes.");
    } finally {
      setSavingAll(false);
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleFormattedPlan = async (plan) => {
    const formattedDays = [];
  
    for (const dayObj of plan) {
      const dayData = {};
      const usedUris = new Set();
  
      for (const meal of ['Breakfast', 'Lunch', 'Dinner']) {
        const mealSection = dayObj.sections?.[meal];
        const assignedUri = mealSection?.assigned;
  
        if (assignedUri && !usedUris.has(assignedUri)) {
          try {
            await delay(250); // ⏳ Add 250ms delay between each recipe fetch
            const recipe = await fetchRecipeDetails(assignedUri);
            dayData[meal.toLowerCase()] = recipe;
            usedUris.add(assignedUri); 
          } catch (err) {
            console.error(`Failed to fetch recipe for ${meal}:`, err.message);
          }
        } else if (assignedUri && usedUris.has(assignedUri)) {
          console.warn(`Duplicate URI found for ${meal}, skipping:`, assignedUri);
        }
      }
  
      formattedDays.push(dayData);
    }
  
    setMealPlans(formattedDays);
    setMessages(prev => [...prev, { role: 'assistant', type: 'mealPlan', content: formattedDays }]);

  };
  
  


  const startTypingAnimation = () => {
    let dots = '';
    const interval = setInterval(() => {
      dots = dots.length < 3 ? dots + '.' : '';
      setMessages(prev => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        if (typeof last.content !== 'string') return prev; // 🛡️ Protect here
        if (last.content.startsWith('Typing')) {
          const updated = { ...last, content: `Typing${dots}` };
          return [...prev.slice(0, -1), updated];
        }
        return prev;
      });
    }, 500);
    setTypingAnimation(interval);
  };
  

const stopTypingAnimation = () => {
  if (typingAnimation) {
    clearInterval(typingAnimation);
    setTypingAnimation(null);
  }
};


const handleSend = async () => {
  if (!input.trim()) return;
  const userInput = input.trim();
  setInput('');
  setLoading(true);

  const normalizedInput = userInput.toLowerCase();
  const asksForMealPlan =
    (normalizedInput.includes('meal') && normalizedInput.includes('plan')) &&
    (normalizedInput.includes('generate') || normalizedInput.includes('make') || normalizedInput.includes('create') || normalizedInput.includes('want'));

  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('No token found. Please log in.');

    if (asksForMealPlan) {
      setSavedAll(false);
      setMealPlans([]);

      setMessages(prev => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: 'Typing' }
      ]);
      startTypingAnimation();

      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/generate-plan`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const plan = res.data.mealPlan || [];

      stopTypingAnimation();
      setMessages(prev => [...prev.slice(0, -1)]); // Remove Typing
      await handleFormattedPlan(plan);

    } else {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'assistant', content: 'Typing' }
      ]);
      startTypingAnimation();

      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/chat`,
        { message: userInput },
        { headers: { Authorization: `Bearer ${token}` }
      });

      const aiReply = res.data.reply || "Sorry, I didn't understand that.";

      stopTypingAnimation();
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: aiReply }
      ]);
    }
  } catch (err) {
    console.error('Chatbot error:', err);
    Alert.alert('Error', 'Failed to process your request.');
    stopTypingAnimation();
    setMessages(prev => prev.filter(m => m.content !== 'Typing'));
  } finally {
    setLoading(false);
    inputRef.current?.focus();
  }
};


  const renderMealPlan = (plan) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return (
      <View style={localStyles.planContainer}>
        {plan.map((day, idx) => {
          const totalCalories = ['breakfast', 'lunch', 'dinner'].map(meal => day[meal]?.calories || 0).reduce((a, b) => a + b, 0);
          return (
            <View key={idx} style={localStyles.dayBlock}>
              <Text style={localStyles.dayText}>{dayNames[idx % 7]} ({Math.round(totalCalories)} kcal)</Text>
              <View style={localStyles.mealRow}>
                {['breakfast', 'lunch', 'dinner'].map(meal => (
                  day[meal] && (
                    <TouchableOpacity key={meal} onPress={() => handleMealPress(day[meal])} style={localStyles.mealCard}>
                      <Image source={{ uri: day[meal].image }} style={localStyles.mealImage} />
                      <Text style={localStyles.mealLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                    </TouchableOpacity>
                  )
                ))}
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          onPress={saveAllRecipes}
          style={[localStyles.saveAllButton, savedAll && { backgroundColor: 'green' }]}
          disabled={savingAll || savedAll}
        >
          {savingAll ? <ActivityIndicator color="white" /> : <Text style={localStyles.saveAllText}>{savedAll ? "Recipes Saved" : "Save All Recipes"}</Text>}
        </TouchableOpacity>
      </View>
    );

  };

  const handleMealPress = (meal) => {
    if (!meal) return;
    setSelectedMeal(meal);
    setModalVisible(true);
    setSavedSingle(false);
  };

  return (
    <KeyboardAvoidingView style={localStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <BackButton />
      <ScrollView style={localStyles.scrollArea} contentContainerStyle={localStyles.scrollContent} ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((msg, index) => (
          <View key={index} style={[localStyles.chatBubble, { alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#133E7C' : '#F1F0F0' }]}>
            {msg.type === 'mealPlan' ? renderMealPlan(msg.content) : (
              <Text style={[localStyles.chatText, { color: msg.role === 'user' ? 'white' : 'black' }]}>{msg.content}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={localStyles.inputRow}>
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          style={localStyles.inputBox}
          onSubmitEditing={handleSend}
          editable={!loading}
        />
        <TouchableOpacity onPress={handleSend} style={[localStyles.sendButton, loading && { backgroundColor: '#999' }]} disabled={loading}>
          <Text style={localStyles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={localStyles.closeButton}>
              <Text style={localStyles.closeText}>✖</Text>
            </TouchableOpacity>
            {selectedMeal && (
              <>
                <Image source={{ uri: selectedMeal.image }} style={localStyles.modalImage} />
                <Text style={localStyles.modalTitle}>{selectedMeal.label}</Text>
                <Text style={localStyles.modalCalories}>{Math.round(selectedMeal.calories)} kcal</Text>
                <View style={localStyles.modalButtonRow}>
                  <TouchableOpacity
                    style={[localStyles.saveButton, savedSingle && { backgroundColor: 'green' }]}
                    onPress={() => saveRecipe(selectedMeal)}
                    disabled={savingSingle || savedSingle}
                  >
                    {savingSingle ? <ActivityIndicator color="white" /> : <Text style={localStyles.saveButtonText}>{savedSingle ? "Saved!" : "Save"}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[localStyles.saveButton, { backgroundColor: '#ccc' }]}
                    onPress={async () => {
                      try {
                        const newRecipe = await fetchAnotherRecipe(selectedMeal.mealType?.[0] || 'Lunch');
                        setSelectedMeal(newRecipe);
                      } catch (err) {
                        Alert.alert("Error", "Couldn't get another recipe.");
                        console.error(err);
                      }
                    }}
                  >
                    <Text style={[localStyles.saveButtonText, { color: '#333' }]}>Get Another</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// Styles
const localStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  backButtonContainer: { flexDirection: 'row', paddingLeft: 10, marginTop: 10 },
  backArrow: { marginRight: 10 },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 10, paddingVertical: 5 },
  chatBubble: { marginBottom: 10, maxWidth: '90%', padding: 10, borderRadius: 10 },
  chatText: { fontSize: 16 },
  inputRow: { flexDirection: 'row', padding: 10 },
  inputBox: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, fontSize: 16 },
  sendButton: { backgroundColor: '#133E7C', padding: 10, borderRadius: 10, marginLeft: 10 },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
  planContainer: { marginVertical: 10, width: screenWidth * 0.75, alignSelf: 'center' },
  dayBlock: { marginBottom: 25, backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, elevation: 2 },
  dayText: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mealCard: {
    width: '30%',
    aspectRatio: 0.85, // makes card height proportional to width
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    marginBottom: 12,
  },
  
  
  mealLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 4,
  },  
  saveAllButton: { backgroundColor: '#133E7C', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  saveAllText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center', position: 'relative' },
  closeButton: { position: 'absolute', right: 10, top: 10 },
  closeText: { fontSize: 18 },
  modalImage: { width: 220, height: 160, borderRadius: 10, marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  modalCalories: { fontSize: 16, color: '#666', marginBottom: 15 },
  saveButton: { backgroundColor: '#133E7C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10, gap: 10 },
  mealImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
    backgroundColor: '#eaeaea',
  },
  
});