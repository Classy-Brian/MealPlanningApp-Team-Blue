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
  Modal,
  Pressable,
  SafeAreaView,
  Animated
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Tooltip } from 'react-native-elements';
import axios from "axios";
import getUserIdFromToken from "@/components/getUserIdFromToken";
import { styles } from "@/components/Sheet";
import backarrow from "@/assets/images/back_arrow_navigate.png";
import heartIcon from "@/assets/images/heart.png";
import emptyHeartIcon from "@/assets/images/empty-heart.png";
import { colors } from "@/components/Colors";
import { fonts } from "@/components/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Helper to clean an ingredient line by stripping amounts, parentheses, “for garnish,” etc.
const cleanIngredient = (line = "") =>
  line
    .replace(/\(.*?\)/g, "") // drop parentheses
    .replace(/,.*$/g, "") // drop after first comma
    .replace(/^\s*\d+([\/.\d\s]*)?/g, "") // drop leading amounts
    .replace(
      /\b(?:cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|g|grams|kg|pound|lb|lbs)\b\.?/gi,
      ""
    )
    .replace(/for\s+garnish.*$/i, "") // drop “for garnish”
    .trim();


function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
      <TouchableOpacity onPress={() => navigation.navigate('savedrecipes')}>
        <View style={localStyles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Recipes</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const RecipeDetailsScreen = () => {
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
      if (!id) console.warn("User ID not found");
      setUserId(id);
    })();
  }, []);

  const {
    recipeId = "",
    title = "",
    directions = "No directions available.",
    imageUri = "",
    isSaved: initialSaved = true,
    ingredients: rawIngredients = [],
    allergies: rawAllergies = [],
    nutrition: rawNutrition = "{}",
  } = route.params || {};

  // ensure arrays
  const ingredients = Array.isArray(rawIngredients)
    ? rawIngredients
    : String(rawIngredients).split(",");
  const allergies = Array.isArray(rawAllergies)
    ? rawAllergies
    : String(rawAllergies).split(",");
  const nutrition = JSON.parse(
    typeof rawNutrition === "string"
      ? rawNutrition
      : JSON.stringify(rawNutrition)
  );

  // handle missing details
  if (!recipeId || !title || !ingredients.length) {
    return (
      <View style={localStyles.errorContainer}>
        <Text style={localStyles.errorText}>
          Error: Recipe details not passed correctly!
        </Text>
      </View>
    );
  }

  //  save / unsave button logic

  const [isSavedRecipe, setIsSavedRecipe] = useState(initialSaved);

  // UI: Tabs for Ingredients / Allergies / Directions / Nutrition

  const [activeSection, setActiveSection] = useState(0);
  const sections = ["Ingredients", "Allergies", "Directions", "Nutrition"];

  // New: “Add to Grocery” modal state & handlers

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [checked, setChecked] = useState(() => ingredients.map(() => true));

  const saveRecipe = async () => {
    animateIcon(heartScale);
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/save-recipe`,
        { userId, recipeId }
      );
      if (res.status === 200) {
        setIsSavedRecipe(true);
        Alert.alert("Success", "Recipe saved successfully!");
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      Alert.alert('Error', 'Could not save recipe.');
    }
  };

  const unsaveRecipe = async () => {
    animateIcon(heartScale);
    try {
      const res = await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/remove/remove-recipe`,
        { data: { userId, recipeId } }
      );
      if (res.status === 200) {
        setIsSavedRecipe(false);
        Alert.alert("Success", "Recipe unsaved successfully!");
      }
    } catch (err) {
      console.error("Error unsaving recipe:", err);
      Alert.alert("Error", "Could not unsave recipe. Please try again.");
    }
  };

  const toggleChecked = (i) =>  // for grocery ingredient adding
    setChecked((prev) => {
      const c = [...prev];
      c[i] = !c[i];
      return c;
    });

  const renderActionButtons = () => (
    <View style={localStyles.actionButtonContainer}>
      <Tooltip popover={<Text>Save Recipe</Text>}>
        <TouchableOpacity
          style={localStyles.roundButton}
          onPress={() => isSavedRecipe ? unsaveRecipe() : saveRecipe()}
        >
          <Animated.Image
            source={isSavedRecipe ? heartIcon : emptyHeartIcon}
            style={[localStyles.heartIcon, { transform: [{ scale: heartScale }] }]}
          />
        </TouchableOpacity>
      </Tooltip>

      <Tooltip popover={<Text>Mark as Tried</Text>}>
        <TouchableOpacity style={localStyles.roundButton} onPress={tryRecipe}>
          <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale: triedScale }] }}>
            <MaterialCommunityIcons name="check-circle-outline" size={28} color="#1f508f" />
            <Text style={localStyles.roundButtonText}>Tried</Text>
          </Animated.View>
        </TouchableOpacity>
      </Tooltip>
    </View>
  );

  const handleContinueToGrocery = () => {
    const selectedLines = ingredients
      .filter((_, i) => checked[i])
      .map((line) => cleanIngredient(line))
      .filter(Boolean);
    if (!selectedLines.length) {
      Alert.alert("Nothing selected", "Please select at least one ingredient.");
      return;
    }
    setAddModalOpen(false);
    // navigate to your grocery search screen with the batch queue
    navigation.navigate("grocery", {
      screen: "addgroceryingredient",
      params: { batch: selectedLines },
    });
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

  return (
    <SafeAreaView style={localStyles.container}>
      {/* Header */}
      <BackButton />
      {/* <View style={localStyles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("savedrecipes")}>
          <Image source={backarrow} style={localStyles.backIcon} />
        </TouchableOpacity>
      </View> */}

      {/* Image */}
      {imageUri ? (
        <View style={localStyles.recipeWrapper}>
          <Image source={{ uri: imageUri }} style={localStyles.recipeImage} />
        </View>
      ) : (
        <Text style={localStyles.errorText}>No image available</Text>
      )}

      {/* Title & Save */}
      <Text style={localStyles.title}>{title}</Text>
      {renderActionButtons()}

      {/* Tabs */}
      <View style={localStyles.tabContainer}>
        {sections.map((sec, i) => (
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

      {/* Section Content */}
      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        <View style={localStyles.sectionContent}>
          {activeSection === 0 && (
            <>
              <Text style={localStyles.sectionTitle}>Ingredients:</Text>
              {ingredients.map((line, idx) => (
                <Text key={idx} style={localStyles.sectionText}>
                  • {line}
                </Text>
              ))}

              {/* NEW: Add to Grocery List button */}
              <TouchableOpacity
                style={[
                  localStyles.saveButton,
                  { marginTop: 20, borderColor: colors.primary },
                ]}
                onPress={() => {
                  setChecked(ingredients.map(() => true));
                  setAddModalOpen(true);
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  Add to Grocery List
                </Text>
              </TouchableOpacity>
            </>
          )}

          {activeSection === 1 && (
            <>
              <Text style={localStyles.sectionTitle}>Allergy Information:</Text>
              {allergies.length ? (
                allergies.map((a, i) => (
                  <Text key={i} style={localStyles.sectionText}>
                    • {a}
                  </Text>
                ))
              ) : (
                <Text style={localStyles.sectionText}>
                  No allergy information.
                </Text>
              )}
            </>
          )}

          {activeSection === 2 && (
            <>
              <Text style={localStyles.sectionTitle}>Directions:</Text>
              <Text style={localStyles.sectionText}>{directions}</Text>
            </>
          )}

          {activeSection === 3 && (
            <>
              <Text style={localStyles.sectionTitle}>Nutrition Facts:</Text>
              {nutrition ? (
                Object.entries(nutrition).map(([key, val]) => (
                  <Text key={key} style={localStyles.sectionText}>
                    {val.label}: {Math.round(val.quantity || 0)} {val.unit}
                  </Text>
                ))
              ) : (
                <Text style={localStyles.sectionText}>No nutrition data.</Text>
              )}
            </>
          )}
          {activeSection === 3 && nutrition && Object.keys(nutrition).map((key) => {
            const { label, quantity, unit } = nutrition[key];
            return (
              <Text key={key} style={localStyles.sectionText}>
                {label}: {Math.round(quantity || 0)} {unit}
              </Text>
            );
          })}
        </View>
      </ScrollView>

      {/* Select‑Ingredients Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={addModalOpen}
        onRequestClose={() => setAddModalOpen(false)}
      >
        <Pressable
          style={localStyles.modalBackdrop}
          onPress={() => setAddModalOpen(false)}
        >
          <Pressable style={localStyles.modalBox}>
            <Text style={localStyles.modalTitle}>Select Ingredients</Text>
            <ScrollView>
              {ingredients.map((line, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={localStyles.checkRow}
                  onPress={() => toggleChecked(idx)}
                >
                  <Ionicons
                    name={checked[idx] ? "checkbox" : "square-outline"}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={localStyles.checkLabel}>
                    {cleanIngredient(line)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={localStyles.modalActions}>
              <TouchableOpacity
                style={[localStyles.modalBtn, localStyles.cancelBtn]}
                onPress={() => setAddModalOpen(false)}
              >
                <Text style={styles.regularText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.modalBtn, localStyles.contBtn]}
                onPress={handleContinueToGrocery}
              >
                <Text style={styles.regularText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", padding: 16 },
  backIcon: { width: 24, height: 24 },
  recipeWrapper: {
    width: "100%",
    height: 220,
    overflow: "hidden",
    marginBottom: 16,
  },
  recipeImage: { width: "100%", height: "100%", resizeMode: "cover" },
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
  saveButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
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
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  checkRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  checkLabel: { marginLeft: 10, fontSize: 15 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtn: { backgroundColor: colors.othergrey },
  contBtn: { backgroundColor: colors.primary },
  activeTabText: {
    fontWeight: 'bold',
    color: '#1f508f',
  },
  sectionContent: {
    paddingHorizontal: 10,
    marginTop: 10,
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
