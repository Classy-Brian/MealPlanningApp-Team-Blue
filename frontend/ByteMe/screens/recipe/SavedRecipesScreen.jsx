// updated SavedRecipeScreen to match ExploreRecipesScreen filter setup
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { useNavigation } from '@react-navigation/native';
import { styles } from '@/components/Sheet';
import { fonts } from '@/components/Fonts';
import { Divider } from 'react-native-paper';
import maglass from "@/assets/images/magnifyingglass.png"
import { filterModal } from '@/components/Filter';



export default function Recipes() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    ingredient: '',
    maxCalories: '',
    cuisine: 'All',
    diet: '',
    health: '',
    caution: '',
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    categories: ['All'],
    cuisines: ['All'],
    diets: [],
    healthLabels: [],
    cautions: [],
  });

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const fetchSavedRecipes = async () => {
    setLoading(true);
    try {
      const userId = await getUserIdFromToken();
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-recipes`
      );

      const recipes = response.data?.savedRecipes || [];
      setSavedRecipes(recipes);

      const categoriesSet = new Set();
      const cuisinesSet = new Set();
      const dietSet = new Set();
      const healthSet = new Set();
      const cautionSet = new Set();

      recipes.forEach((r) => {
        r.mealType?.forEach((val) => categoriesSet.add(capitalize(val)));
        r.cuisineType?.forEach((val) => cuisinesSet.add(capitalize(val)));
        r.dietLabels?.forEach((val) => dietSet.add(capitalize(val)));
        r.healthLabels?.forEach((val) => healthSet.add(capitalize(val)));
        r.cautions?.forEach((val) => cautionSet.add(capitalize(val)));
      });

      setAvailableFilters({
        categories: ['All', ...Array.from(categoriesSet)],
        cuisines: ['All', ...Array.from(cuisinesSet)],
        diets: Array.from(dietSet),
        healthLabels: Array.from(healthSet),
        cautions: Array.from(cautionSet),
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      setError("Failed to load saved recipes.");
      Alert.alert("Error", "Could not load saved recipes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const filteredRecipes = savedRecipes.filter((recipe) => {
    return (
      recipe.label.toLowerCase().includes(query.toLowerCase()) &&
      (filters.category === 'All' || recipe.mealType?.some((t) => capitalize(t) === filters.category)) &&
      (filters.cuisine === 'All' || recipe.cuisineType?.some((t) => capitalize(t) === filters.cuisine)) &&
      (filters.ingredient.trim() === '' || recipe.ingredients?.some((line) => line.toLowerCase().includes(filters.ingredient.toLowerCase()))) &&
      (filters.maxCalories.trim() === '' || (!isNaN(parseFloat(filters.maxCalories)) && recipe.calories <= parseFloat(filters.maxCalories))) &&
      (filters.diet === '' || recipe.dietLabels?.some((t) => capitalize(t) === filters.diet)) &&
      (filters.health === '' || recipe.healthLabels?.some((t) => capitalize(t) === filters.health)) &&
      (filters.caution === '' || recipe.cautions?.some((t) => capitalize(t) === filters.caution))
    );
  });

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? 'All' : value }));
  };

  const resetFilters = () => {
    setFilters({ category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', diet: '', health: '', caution: '' });
  };

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
          <Text style={styles.title}>Saved Recipes</Text>

        <View style={det.searchContainer}>
          {/* Search Box */}
          <View style={[styles.searchInput]}>
            <Image 
              style={det.magnifyingGlassIcon} 
              source={maglass} />          
            <TextInput
              placeholder='Search your saved recipes'
              placeholderTextColor={textcolors.darkgrey}
              onChangeText={(text) => setQuery(text)}
              value={query}
              style={styles.regularText}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <MaterialIcons name="filter-list" size={24} color={textcolors.darkgrey} style={{ marginRight: 8 }} />
            <Text style={styles.regularText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <Divider />

        <FlatList
          data={filteredRecipes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={det.recipeContainer}
              onPress={() => {
                navigation.navigate("favorite_recipe", {
                  recipeId: item.uri,
                  title: item.label,
                  imageUri: item.image,
                  ingredients: item.ingredients || [],
                  directions: item.directions || "No directions available.",
                  allergies: item.allergies || [],
                  nutrition: JSON.stringify(item.nutrition),
                });
              }}
            >
              <View style={det.rectangleView}>
                <Image source={{ uri: item.image }} style={det.recipeImage} />
                <Text style={det.recipeTitle}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={!loading && <Text style={det.noRecipesText}>No recipes found.</Text>}
        />

        <Modal visible={filterModalVisible} animationType='slide' transparent={true}>
          <View style={filterModal.modalBackground}>
            <View style={filterModal.modalContainer}>
              <ScrollView>
                <Text style={filterModal.modalTitle}>Filter Options</Text>

                {[
                  ['Category', 'category', availableFilters.categories],
                  ['Cuisine', 'cuisine', availableFilters.cuisines],
                  ['Diet', 'diet', availableFilters.diets],
                  ['Health', 'health', availableFilters.healthLabels],
                  ['Caution', 'caution', availableFilters.cautions],
                ].map(([label, key, options]) => (
                  <View key={key} style={{ marginBottom: 10 }}>
                    <Text style={filterModal.modalLabel}>{label}</Text>
                    <ScrollView horizontal style={filterModal.filterRow}>
                      {options.map((val) => (
                        <TouchableOpacity
                          key={val}
                          style={[filterModal.filterOption, filters[key] === val && filterModal.filterOptionSelected]}
                          onPress={() => toggleFilter(key, val)}
                        >
                          <Text style={filters[key] === val ? filterModal.filterOptionTextSelected : filterModal.filterOptionText}>{val}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ))}

                <Text style={filterModal.modalLabel}>Ingredient</Text>
                <TextInput
                  style={filterModal.modalInput}
                  placeholder='e.g. chicken'
                  value={filters.ingredient}
                  onChangeText={(text) => setFilters({ ...filters, ingredient: text })}
                />

                <Text style={filterModal.modalLabel}>Max Calories</Text>
                <TextInput
                  style={filterModal.modalInput}
                  placeholder='e.g. 500'
                  keyboardType='numeric'
                  value={filters.maxCalories}
                  onChangeText={(text) => setFilters({ ...filters, maxCalories: text })}
                />

                <View style={filterModal.modalActions}>
                  <TouchableOpacity onPress={resetFilters} style={filterModal.cancelButton}>
                    <Text style={{ color: 'black' }}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={filterModal.applyButton}>
                    <Text style={{ color: 'white' }}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {loading && <ActivityIndicator size="large" color={colors.primary} />}
        {error && <Text style={det.error}>{error}</Text>}
      </View>
      

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('explore_recipe')}>
        <Ionicons name="add" size={60} color="#d9d9d9" />
      </TouchableOpacity>
    </View>
  );
}

const det = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.primary },
  searchContainer: { marginBottom: 10 },
  inputContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    backgroundColor: colors.white,
  },
  inputText: { flex: 1, fontSize: 16, paddingVertical: 8 },
  recipeContainer: { alignItems: 'center', paddingVertical: 10 },
  rectangleView: {
    height: 150,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 80, 143, 0.06)',
    borderColor: '#777',
    borderWidth: 1,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  recipeImage: { width: '100%', height: 100, resizeMode: 'cover' },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#133E7C', marginTop: 5 },
  noRecipesText: { 
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,},
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
  addButtonText: { fontSize: 30, color: '#fff' },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },  
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 15, // Space between the icon and input
  },
});