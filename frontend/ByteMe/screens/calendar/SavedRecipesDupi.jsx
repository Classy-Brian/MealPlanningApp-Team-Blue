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
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { useNavigation } from '@react-navigation/native';
import { styles as sharedStyles } from '@/components/Sheet';

const SavedRecipesDupi = () => {
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
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-recipes`);

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
    setFilters({
      category: 'All',
      cuisine: 'All',
      ingredient: '',
      maxCalories: '',
      diet: '',
      health: '',
      caution: '',
    });
  };

  const handleSelectRecipe = (recipe) => {
    navigation.navigate('addday', {
      selectedRecipe: {
        label: recipe.label,
        value: recipe.uri,
        calories: recipe.calories || 0,
      }
    });
  };

  return (
    <View style={det.container}>
      <Text style={sharedStyles.title}>Browse Saved Recipes</Text>

      <View style={det.searchContainer}>
        <View style={det.inputContainer}>
          <TextInput
            placeholder="Search your recipes"
            placeholderTextColor={textcolors.lightgrey}
            style={det.inputText}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <TouchableOpacity style={det.filterButton} onPress={() => setFilterModalVisible(true)}>
          <MaterialIcons name="filter-list" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={det.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={det.recipeContainer}
            onPress={() => handleSelectRecipe(item)}
          >
            <View style={det.rectangleView}>
              <Image source={{ uri: item.image }} style={det.recipeImage} />
              <Text style={det.recipeTitle}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={det.noRecipesText}>No recipes found.</Text>}
      />

      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
        <View style={det.modalBackground}>
          <View style={det.modalContainer}>
            <ScrollView>
              <Text style={det.modalTitle}>Filter Options</Text>

              {[
                ['Category', 'category', availableFilters.categories],
                ['Cuisine', 'cuisine', availableFilters.cuisines],
                ['Diet', 'diet', availableFilters.diets],
                ['Health', 'health', availableFilters.healthLabels],
                ['Caution', 'caution', availableFilters.cautions],
              ].map(([label, key, options]) => (
                <View key={key} style={{ marginBottom: 10 }}>
                  <Text style={det.modalLabel}>{label}</Text>
                  <ScrollView horizontal style={det.filterRow}>
                    {options.map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[det.filterOption, filters[key] === val && det.filterOptionSelected]}
                        onPress={() => toggleFilter(key, val)}
                      >
                        <Text style={filters[key] === val ? det.filterOptionTextSelected : det.filterOptionText}>{val}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}

              <Text style={det.modalLabel}>Ingredient</Text>
              <TextInput
                style={det.modalInput}
                placeholder="e.g. chicken"
                value={filters.ingredient}
                onChangeText={(text) => setFilters({ ...filters, ingredient: text })}
              />

              <Text style={det.modalLabel}>Max Calories</Text>
              <TextInput
                style={det.modalInput}
                placeholder="e.g. 500"
                keyboardType="numeric"
                value={filters.maxCalories}
                onChangeText={(text) => setFilters({ ...filters, maxCalories: text })}
              />

              <View style={det.modalActions}>
                <TouchableOpacity onPress={resetFilters} style={det.cancelButton}>
                  <Text style={{ color: 'black' }}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={det.applyButton}>
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
  );
};

const det = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
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
  filterButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 12,
    alignItems: 'center',
  },
  filterButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
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
  noRecipesText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: textcolors.lightgrey },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' },
  modalContainer: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalLabel: { fontWeight: '600', marginTop: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  applyButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flex: 1,
    alignItems: 'center',
  },
  filterRow: { flexDirection: 'row', marginTop: 5, marginBottom: 10 },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    marginRight: 8,
  },
  filterOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterOptionText: { color: textcolors.darkgrey },
  filterOptionTextSelected: { color: '#fff' },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default SavedRecipesDupi;
