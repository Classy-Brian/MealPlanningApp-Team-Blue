// RecipeSearch.jsx
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import HomeB from "@/assets/images/active.png";
import maglass from "@/assets/images/magnifyingglass.png";
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';
import Back_butt from "@/assets/images/backbutton.png";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import { filterModal } from '@/components/Filter';

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Saved Recipes</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}


const RecipeSearch = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', dietLabel: '', healthLabel: '', caution: ''
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const navigation = useNavigation();

  const fetchRecipes = async (query) => {
    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${API_ID}&app_key=${API_KEY}`
      );
      setRecipes(response.data.hits || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to fetch recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(recipes.flatMap(r => r.recipe.mealType || []))];
  const cuisines = ['All', ...new Set(recipes.flatMap(r => r.recipe.cuisineType || []).map(c => c.charAt(0).toUpperCase() + c.slice(1)))];
  const dietLabels = [...new Set(recipes.flatMap(r => r.recipe.dietLabels || []))];
  const healthLabels = [...new Set(recipes.flatMap(r => r.recipe.healthLabels || []))];
  const cautions = [...new Set(recipes.flatMap(r => r.recipe.cautions || []))];

  const filteredRecipes = recipes.filter(({ recipe }) => {
    const matchesCategory = filters.category === 'All' || recipe.mealType?.some(type => type.toLowerCase().includes(filters.category.toLowerCase()));
    const matchesCuisine = filters.cuisine === 'All' || recipe.cuisineType?.some(type => type.toLowerCase().includes(filters.cuisine.toLowerCase()));
    const matchesIngredient = filters.ingredient.trim() === '' || recipe.ingredientLines?.some(line => line.toLowerCase().includes(filters.ingredient.toLowerCase()));
    const matchesCalories = filters.maxCalories.trim() === '' || (!isNaN(parseFloat(filters.maxCalories)) && recipe.calories <= parseFloat(filters.maxCalories));
    const matchesDiet = filters.dietLabel === '' || recipe.dietLabels?.includes(filters.dietLabel);
    const matchesHealth = filters.healthLabel === '' || recipe.healthLabels?.includes(filters.healthLabel);
    const matchesCaution = filters.caution === '' || recipe.cautions?.includes(filters.caution);
    return matchesCategory && matchesCuisine && matchesIngredient && matchesCalories && matchesDiet && matchesHealth && matchesCaution;
  });

  const resetFilters = () => {
    setFilters({ category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', dietLabel: '', healthLabel: '', caution: '' });
  };

  const toggleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? (key === 'category' || key === 'cuisine' ? 'All' : '') : value }));
  };

  return (
    <View style={det.container}>
      <View style={det.searchSection}>
        <BackButton />
        <Text style={styles.title}>Search Recipes</Text>
        
        <View style={styles.searchInput}>
          <Image source={maglass} style={det.magnifyingGlassIcon} />
          <TextInput
            placeholder="Search Recipes"
            placeholderTextColor={textcolors.darkgrey}
            style={styles.regularText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchRecipes(searchQuery)}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <MaterialIcons name="filter-list" size={24} color={textcolors.darkgrey} style={{ marginRight: 8 }} />
          <Text style={styles.regularText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('recipe_details', {
              recipeId: item.recipe.uri,
              title: item.recipe.label,
              ingredients: item.recipe.ingredientLines,
              directions: item.recipe.url,
              imageUri: item.recipe.image,
              allergies: item.recipe.healthLabels,
              nutrition: item.recipe.totalNutrients
            })}
            style={{ width: '48%', marginBottom: 16 }}
          >
            <Image source={{ uri: item.recipe.image }} style={{ width: '100%', height: 120, borderRadius: 10 }} resizeMode="cover" />
            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>{item.recipe.label}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      />

      {/* Floating Chatbot Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('chat_bot')}
        style={det.chatbotButton}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={filterModal.modalBackground}>
          <View style={filterModal.modalContainer}>
                  {/* Close Button */}
                <TouchableOpacity style={det.closeButton} onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
            <ScrollView>
              <Text style={filterModal.modalTitle}>Filter Options</Text>
              {[
                ['Category', 'category', categories],
                ['Cuisine', 'cuisine', cuisines],
                ['Diet', 'dietLabel', dietLabels],
                ['Health', 'healthLabel', healthLabels],
                ['Caution', 'caution', cautions]
              ].map(([label, key, list]) => (
                <View key={key} style={{ marginBottom: 10 }}>
                  <Text style={filterModal.modalLabel}>{label}</Text>
                  <ScrollView horizontal>
                    {list.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => toggleFilter(key, item)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          marginRight: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: textcolors.lightgrey,
                          backgroundColor: filters[key] === item ? colors.primary : 'transparent'
                        }}
                      >
                        <Text style={{ color: filters[key] === item ? '#fff' : textcolors.darkgrey }}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
              <Text style={filterModal.modalLabel}>Ingredient</Text>
              <TextInput
                placeholder="e.g. chicken"
                value={filters.ingredient}
                onChangeText={(val) => setFilters({ ...filters, ingredient: val })}
                style={filterModal.modalInput}
              />
              <Text style={filterModal.modalLabel}>Max Calories</Text>
              <TextInput
                placeholder="e.g. 500"
                keyboardType="numeric"
                value={filters.maxCalories}
                onChangeText={(val) => setFilters({ ...filters, maxCalories: val })}
                style={filterModal.modalInput}
              />
              <View style={filterModal.modalActions}>
                <TouchableOpacity onPress={resetFilters} style={filterModal.cancelButton}>
                  <Text style={styles.regularText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={filterModal.applyButton}>
                  <Text style={styles.regularText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const det = StyleSheet.create({
  // ... (rest of styles from your file)
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#133E7C',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20
  },
  searchSection: {
    paddingVertical: 10
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#D7E2F1',
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start'
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  backText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.primary
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 15
  },
  inputText: {
    fontSize: 20,
    paddingVertical: 10,
    flex: 1
  },
  filterButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 12,
    alignItems: 'center'
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5
  },
  modalInput: {
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  resetButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  applyButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flex: 1,
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
});

export default RecipeSearch;