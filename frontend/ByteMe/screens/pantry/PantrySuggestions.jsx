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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { styles } from '@/components/Sheet'
import { useRouter } from 'expo-router'
import { colors } from '@/components/Colors'
import { textcolors } from '@/components/TextColors'
import { Divider } from 'react-native-paper'
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios'
import { filterModal } from '@/components/Filter'
import { fonts } from '@/components/Fonts';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePantry } from '@/components/PantryContext';


function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Pantry</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const PantrySuggestions = ( { route } ) => {
  const { suggestions: recipes, loading, reloadSuggestions } = usePantry()
  // const [recipes, setRecipes] = useState([]);
  const { ingrLabels } = route.params
  // const [loading, setLoading] = useState(false) 
  const [error, setError] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const navigation = useNavigation();

  
  const [filters, setFilters] = useState({
      category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', dietLabel: '', healthLabel: '', caution: ''
    });

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? 'All' : value }));
  };

  const resetFilters = () => {
    setFilters({ category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', dietLabel: '', healthLabel: '', caution: '' });
  };

  useFocusEffect(
    useCallback(() => {
      if (ingrLabels?.length > 0) {
        reloadSuggestions(ingrLabels)
      }
    }, [JSON.stringify(ingrLabels)])
  )

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

  // console.log(`Recipe array length of ${recipes.length} and example`, recipes[0])
  // console.log('Filtered recipe count: ', filteredRecipes.length)
  // console.log('First filtered recipe:', filteredRecipes[0])

  return (
    <View style={styles.whiteBackground}>
        <View style={styles.screenContainer}>
          <BackButton />
          
          <Text style={styles.title}>Pantry Suggestions</Text>
          <View style={{marginBottom: 10}}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <MaterialIcons name="filter-list" size={24} color={textcolors.darkgrey} style={{ marginRight: 8 }} />
              <Text style={styles.regularText}>Filter</Text>
            </TouchableOpacity>
          </View>
          

          <Divider style={{marginBottom: 10}}/>
          <FlatList
              data={filteredRecipes}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('pantry_recipe_details', {
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
              ListFooterComponent={loading ? <ActivityIndicator size="large" color={colors.primary} /> : <View style={det.space } />}
              ListEmptyComponent={
                !loading && <Text style={det.noRecipesText}>No recipes could be found. Try adding more ingredients to your pantry!</Text>
              }
            />
          
          <Modal visible={filterModalVisible} animationType="slide" transparent>
            <View style={filterModal.modalBackground}>
              <View style={filterModal.modalContainer}>
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
                      <ScrollView horizontal style={filterModal.filterRow}>
                        {list.map((item) => (
                          <TouchableOpacity
                            key={item}
                            onPress={() => toggleFilter(key, item)}
                            style={[filterModal.filterOption, filters[key] === item && filterModal.filterOptionSelected]}
                          >
                            <Text style={filters[key] === item ? filterModal.filterOptionTextSelected : filterModal.filterOptionText }>{item}</Text>
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
    </View>
  )
}

export default PantrySuggestions

const det = StyleSheet.create({
  recipeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  recipeSuggestionBox: {
    backgroundColor: colors.grey,
    borderRadius: 10,
    height: 175,
    width: 175,
    borderColor: textcolors.darkgrey,
    borderWidth: 1,
    marginTop: 10,
  },
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
  noRecipesText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
  },
  space: {
    marginBottom: 100
  }
})