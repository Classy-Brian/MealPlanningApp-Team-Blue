// START OF FILE
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Tooltip } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { colors } from '@/components/Colors';
import backarrow from '@/assets/images/back_arrow_navigate.png';
import heartIcon from '@/assets/images/heart.png';
import emptyHeartIcon from '@/assets/images/empty-heart.png';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
      <TouchableOpacity onPress={() => navigation.navigate('savedrecipes')}>
        <View style={det.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={det.regularText}>Recipes</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const RecipeDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);

  const heartScale = useRef(new Animated.Value(1)).current;
  const triedScale = useRef(new Animated.Value(1)).current;

  const animateIcon = (animRef) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const {
    recipeId = '',
    title = '',
    directions = 'No directions available.',
    imageUri = '',
    isSaved = false,
    calories = 0,
  } = route.params || {};

  const ingredients = typeof route.params['ingredients'] === 'string'
    ? route.params['ingredients'].split(',')
    : route.params['ingredients'];

  const allergies = typeof route.params['allergies'] === 'string'
    ? route.params['allergies'].split(',')
    : route.params['allergies'];

  const nutrition = JSON.parse(typeof route.params.nutrition === 'string'
    ? route.params.nutrition
    : JSON.stringify(route.params.nutrition));

  const [activeSection, setActiveSection] = useState(0);
  const [isSavedRecipe, setIsSavedRecipe] = useState(true);
  const sections = ['Ingredients', 'Allergies', 'Directions', 'Nutrition'];

  const saveRecipe = async () => {
    animateIcon(heartScale);
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`, {
        userId,
        recipeId,
      });
      if (response.status === 200) {
        setIsSavedRecipe(true);
        Alert.alert('Success', 'Recipe saved successfully!');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('Error', 'Could not save recipe.');
    }
  };

  const unsaveRecipe = async () => {
    animateIcon(heartScale);
    try {
      const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/remove/remove-recipe`, {
        data: { userId, recipeId },
      });
      if (response.status === 200) {
        setIsSavedRecipe(false);
        Alert.alert('Success', 'Recipe unsaved successfully!');
      }
    } catch (err) {
      console.error('Error unsaving recipe:', err);
      Alert.alert('Error', 'Could not remove recipe.');
    }
  };

  const tryRecipe = async () => {
    animateIcon(triedScale);
  
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');
      const calories = nutrition?.ENERC_KCAL?.quantity || 0;

  
      const triedRes = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/recipe-tried`,
        {
          userId,
          recipeId,
          title,
          calories
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (triedRes.status === 200) {
        setTimeout(async () => {
          const syncRes = await axios.get(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/profile/updated/sync`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          if (syncRes.status === 200) {
            await AsyncStorage.setItem('syncedUser', JSON.stringify(syncRes.data));
            console.log('Profile synced successfully');
          }
  
          await unsaveRecipe();
          Alert.alert('Great!', 'Marked as tried and goals updated!');
          navigation.navigate('savedrecipes');
        }, 500);
      }
    } catch (err) {
      console.error('Error marking as tried:', err);
      Alert.alert('Error', 'Could not update your goals.');
    }
  };
  
  

  const renderActionButtons = () => (
    <View style={det.actionButtonContainer}>
      <Tooltip popover={<Text>Save Recipe</Text>}>
        <TouchableOpacity
          style={det.roundButton}
          onPress={() => isSavedRecipe ? unsaveRecipe() : saveRecipe()}
        >
          <Animated.Image
            source={isSavedRecipe ? heartIcon : emptyHeartIcon}
            style={[det.heartIcon, { transform: [{ scale: heartScale }] }]}
          />
        </TouchableOpacity>
      </Tooltip>

      <Tooltip popover={<Text>Mark as Tried</Text>}>
        <TouchableOpacity style={det.roundButton} onPress={tryRecipe}>
          <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale: triedScale }] }}>
            <MaterialCommunityIcons name="check-circle-outline" size={28} color="#1f508f" />
            <Text style={det.roundButtonText}>Tried</Text>
          </Animated.View>
        </TouchableOpacity>
      </Tooltip>
    </View>
  );

  return (
    <View style={det.container}>
      <View style={det.header}>
        <BackButton />
      </View>
      {imageUri ? (
        <View style={localStyles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={localStyles.recipeImage} />
        </View>
      ) : (
        <Text style={localStyles.errorText}>No image available</Text>
      )}
      <Text style={det.title}>{title}</Text>
      {renderActionButtons()}

      <View style={det.tabContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={i}
            style={[
              localStyles.tab,
              activeSection === i && localStyles.activeTab,
            ]}
            onPress={() => setActiveSection(i)}
          >
            <Text
              style={[
                localStyles.tabText,
                activeSection === i && localStyles.activeTabText,
              ]}
            >
              {sec}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={det.scrollContent}>
        <View style={det.sectionContent}>
          {activeSection === 0 && ingredients?.map((ing, idx) => (
            <Text key={idx} style={det.sectionText}>- {ing}</Text>
          ))}
          {activeSection === 1 && allergies?.map((al, idx) => (
            <Text key={idx} style={det.sectionText}>- {al}</Text>
          ))}
          {activeSection === 2 && (
            <Text style={det.sectionText}>{directions}</Text>
          )}
          {activeSection === 3 && nutrition && Object.keys(nutrition).map((key) => {
            const { label, quantity, unit } = nutrition[key];
            return (
              <Text key={key} style={det.sectionText}>
                {label}: {Math.round(quantity || 0)} {unit}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const det = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.primary,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 15,
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderColor: '#1f508f',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
    flexShrink: 0,
    flexGrow: 0,
  },
  roundButtonText: {
    fontSize: 10,
    color: '#1f508f',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  heartIcon: {
    width: 32,
    height: 32,
  },
  recipeWrapper: {
    width: '100%',
    height: 220,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 15,
  },
  heartIcon: { width: 24, height: 24 },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: "#555" },
  activeTabText: { color: colors.primary, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionContent: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  sectionText: { fontSize: 14, marginVertical: 2 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: colors.red },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0006",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  greybutton: {
    flexDirection: 'row',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.othergrey,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: colors.black,
  },
});

export default RecipeDetailsScreen;
