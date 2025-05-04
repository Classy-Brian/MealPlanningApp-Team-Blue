import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator, Modal, ScrollView, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '@/components/Sheet'
import { Divider } from 'react-native-paper'
import { textcolors } from '@/components/TextColors'
import { colors } from '@/components/Colors'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { fonts } from '@/components/Fonts'
import maglass from "@/assets/images/magnifyingglass.png"
import chright from "@/assets/images/chevron_right.png"
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import getUserIdFromToken from '@/components/getUserIdFromToken'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { filterModal } from '@/components/Filter'

const SingleIngredient = ({ ingredient }) => {
  // console.log("Single ingredient being passed:", ingredient);  // checks what data is passed as ingredient
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('edit_pantry', {ingredient})
  }

  return(
    <TouchableOpacity style={det.box} onPress={handlePress}>
      <View style={det.boxContainer}>
        <View style={det.leftcontain}>
          <Image 
            style={det.ingredientIcon}
            source={{
              uri: ingredient?.image || "https://via.placeholder.com/150",
            }}/>
          <View>                  
            <Text style={styles.regText16}>
            {ingredient?.label} </Text>
            <Text style={styles.regText16}>
              x {ingredient?.quantity} </Text>
          </View>
        </View>
        <Image source={chright}/>
      </View>                         
    </TouchableOpacity>
  )
}

const Category = ({ category, ingredients, filteredPantry }) => {
  // console.log("Ingredients being passed into Category:", ingredients)
  return(
    <View style={{marginHorizontal: 15}}> 
      <Text style={det.heading}>{category}</Text>
      <FlatList
        data={ingredients}
        keyExtractor={( item, index ) => item.foodId || index.toString()}
        renderItem={({ item }) => <SingleIngredient ingredient={item} />}
      />
      <Divider />
    </View>
  )
}

function AddButton() {
  return(
    <View style={styles.addButton}>
        <Ionicons name="add" size={60} color='#d9d9d9' />
    </View>
  )
}

function CancelAddButton() {
  return (
    <View style={styles.cancelAddButton}>
      <Ionicons name="add" size={60} color='#10386D' style={{transform: [{rotateZ: '45deg'}]}}/>
    </View>    
  )
}

function AddFromGList() {
  return(
    <View style={det.addContainer}>
      <View style={[det.button, {marginRight: 10}]}>
        <Text style={[styles.regText16, {fontFamily: fonts.medium}]}>Add From Grocery List</Text>
      </View>
      <View style={det.addButton}>
          <Ionicons name="add" size={15} color='#d9d9d9' />
      </View>
    </View>
  )  
}

function GoPantrySuggest() {
  return(
    <View style={det.addContainer}>
      <View style={[det.button, {marginRight: 10}]}>
        <Text style={[styles.regText16, {fontFamily: fonts.medium}]}>Suggest Recipes</Text>
      </View>
      <View style={det.addButton}>
          <Ionicons name="add" size={15} color='#d9d9d9' />
      </View>
    </View>
  )
}

const Pantry = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [savedPantry, setSavedPantry] = useState([]);
  const [groupedPantry, setGroupedPantry] = useState({});
  const [loading, setLoading] = useState(false);
  const [ingrLabels, setIngrLabels] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])

  const [addPress, setAddPress] = useState(false);

  // const [filters, setFilters] = useState({
  //     category: 'All', 
  //     maxCalories: '', 
  //     maxProtein: '', 
  //     maxFat: '', 
  //     maxCarb: '', 
  //     maxFiber: ''
  //   });

  const [filters, setFilters] = useState({
    kcal: { mode: "max", value: "" },
    protein: { mode: "max", value: "" },
    fat: { mode: "max", value: "" },
    carb: { mode: "max", value: "" },
    fiber: { mode: "max", value: "" },
    qty: { mode: "max", value: "" },
  });


  const toggleFilter = (key, value) => {
    if (!value || typeof value !== 'string') return;
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? 'All' : value }));
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setFilters({
      kcal: { mode: "max", value: "" },
      protein: { mode: "max", value: "" },
      fat: { mode: "max", value: "" },
      carb: { mode: "max", value: "" },
      fiber: { mode: "max", value: "" },
      qty: { mode: "max", value: "" },
    });
  };

  const categories = ['All', ...new Set(savedPantry.flatMap(ingredient => ingredient.category || []))];
  // const calories = [...new Set(savedPantry.flatMap(ingredient => ingredient.nutrients.ENERC_KCAL || []))];
  // const proteins = [...new Set(savedPantry.flatMap(r => r.recipe.dietLabels || []))];
  // const totFat = [...new Set(savedPantry.flatMap(r => r.recipe.healthLabels || []))];
  // const totCarb = [...new Set(savedPantry.flatMap(r => r.recipe.cautions || []))];
  // const fibers = [...new Set(savedPantry.flatMap(r => r.recipe.cautions || []))];



  const translateY1 = useSharedValue(0);
  const opacity = useSharedValue(0);

  const fetchSavedPantry = async () => {
    setLoading(true);
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-pantry`
      );
      
      if (!response.data || !response.data.savedPantry || response.data.savedPantry.length === 0) {
        console.warn("No saved pantry ingredients found.");
        setSavedPantry([]);
        setLoading(false);
        return;
      }

      const groupedData = response.data.savedPantry.reduce((acc, ingredient) => {
        const category = ingredient.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(ingredient);
        return acc;
      }, {});
      setGroupedPantry(groupedData);
      // console.log("Grouped data: ", groupedData)
      setSavedPantry(response.data.savedPantry);


    } catch (err) {
      console.error("Error fetching saved pantry ingredients:", err);
      setError("Failed to load saved pantry ingredients.");
      Alert.alert("Error!", "Could not load user's saved pantry ingredients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedPantry()
  }, []);

  useEffect(() => {
    if (savedPantry.length > 0) {
      setIngrLabels(savedPantry.map(ingredient => ingredient.label))
    } else {
      setIngrLabels([])
    };
  }, [savedPantry])

  const toggleAdd = () => {

    translateY1.value = withTiming(addPress ? 0 : -20, {
      duration: 400,
      easing: Easing.inOut(Easing.quad),
    });

    opacity.value = withTiming( addPress ? 0: 1, {
      duration: 400,
      easing: Easing.inOut(Easing.quad),
    });

    setAddPress((prev) => !prev)
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY1.value}],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleSuggest = () => {
    if (addPress == true) {
      navigation.navigate('pantry_suggest', {ingrLabels})
    } else {
      return
    }
  }

  const handleToGrocery = () => {
    if (addPress == true) {
      navigation.navigate('add_from_grocery')
    } else {
      return
    }
  }

  

  const filteredGroupedPantry = Object.entries(groupedPantry).reduce((acc, [category, ingredients]) => {
    const filteredIngredients = ingredients.filter( ingredient => {
      const n = ingredient.nutrients || {}
      const matchesQuery = ingredient.label?.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = filters.category === 'All' || (
        typeof ingredient.category === 'string' ? ingredient.category.toLowerCase().includes(filters.category?.toLowerCase() || '')
        : Array.isArray(ingredient.category)
          ? ingredient.category.some(type => type.toLowerCase().includes(filters.category?.toLowerCase() || '')) : false
      )
      // const matchesCalories = !filters.maxCalories.trim() || (!isNaN(parseFloat(filters.maxCalories)) && ingredient.nutrients.ENERC_KCAL <= parseFloat(filters.maxCalories))
      // const matchesProtein = !filters.maxProtein.trim() || (!isNaN(parseFloat(filters.maxProtein)) && ingredient.nutrients.PROCNT <= parseFloat(filters.maxProtein))
      // const matchesFat = !filters.maxFat.trim() || (!isNaN(parseFloat(filters.maxFat)) && ingredient.nutrients?.FAT <= parseFloat(filters.maxFat));
      // const matchesCarbs = !filters.maxCarb.trim() || (!isNaN(parseFloat(filters.maxCarb)) && ingredient.nutrients?.CHOCDF <= parseFloat(filters.maxCarb));
      // const matchesFiber = !filters.maxFiber.trim() || (!isNaN(parseFloat(filters.maxFiber)) && ingredient.nutrients?.FIBTG <= parseFloat(filters.maxFiber));

      const checkBound = (field, boundObj) => {
        const k = boundObj.value.trim();
        if (!k) return true;
        if (isNaN(+k)) return false;
        return boundObj.mode === "max"
          ? (n[field] || 0) <= +k : (n[field] || 0) >= +k;
      };

      const nutrMatch = 
        checkBound("ENERC_KCAL", filters.kcal) &&
        checkBound("PROCNT", filters.protein) &&
        checkBound("FAT", filters.fat) &&
        checkBound("CHOCDF", filters.carb) &&
        checkBound("FIBTG", filters.fiber);

      const qtyMatch = (() => {
        const b = filters.qty;
        const v = b.value.trim();
        if (!v) return true;
        if (isNaN(+v)) return false;
        return b.mode === "max" ? ingredient.quantity <= +v : ingredient.quantity >= +v;
      })();
      return matchesQuery && matchesCategory && nutrMatch && qtyMatch;
      // return matchesQuery && matchesCategory && matchesCalories && matchesProtein && matchesFat && matchesCarbs && matchesFiber
    }
    )
    if (filteredIngredients.length > 0) {
      acc[category] = filteredIngredients
    }
    return acc
  }, {})

  return (
    <View style={styles.whiteBackground}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.screenContainer}>
            <Text style={styles.title}>Pantry</Text>

            {/* Search Box */}
            <View style={[styles.searchInput]}>
              <Image 
                style={det.magnifyingGlassIcon} 
                source={maglass} />          
              <TextInput
                placeholder='Search for ingredients'
                placeholderTextColor={textcolors.darkgrey}
                onChangeText={(text) => setQuery(text)}
                value={query}
                style={styles.regularText}
              />
            </View>
            <View style={{marginBottom: 10}}>
              <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
                <MaterialIcons name="filter-list" size={24} color={textcolors.darkgrey} style={{ marginRight: 8 }} />
                <Text style={styles.regularText}>Filter</Text>
              </TouchableOpacity>
            </View>
          <Divider />

          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          <Modal 
            visible={filterModalVisible} 
            animationType="slide" 
            transparent
            onRequestClose={() => setFilterModalVisible(false)}>
            {/* <Pressable style={det.backdrop} onPress={() => setFilterModalVisible(false)}>
              <Pressable style={det.sheet}>

              </Pressable>
            </Pressable> */}
            <View style={{flex: 1}}>
              <Pressable style={filterModal.modalBackground} onPress={() => setFilterModalVisible(false)}>
                <View style={filterModal.modalContainer}>
                  <ScrollView>
                    <Text style={filterModal.modalTitle}>Filter Pantry</Text>

                    {/* Categories */}
                    {[
                      ['Category', 'category', categories],
                      // ['Calories', 'calories', calories],
                      // ['Protein', 'proteins', dietLabels],
                      // ['Total Fat', 'fat', healthLabels],
                      // ['Total Carbohydrates', 'carbs', cautions],
                      // ['Fiber ', 'fiber', cautions]
                    ].map(([label, key, list]) => (
                      <View key={key} style={{ marginBottom: 10 }}>
                        <Text style={filterModal.modalLabel}>{label}</Text>
                        <ScrollView horizontal style={filterModal.filterRow} contentContainerStyle={{flexGrow: 1 }}>
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
                    
                    {/* Nutrient + QUantity */}
                    {[
                      ["Calories (kcal)", "kcal", "ENERC_KCAL"],
                      ["Protein (g)", "protein", "PROCNT"],
                      ["Fat (g)", "fat", "FAT"],
                      ["Carbs (g)", "carb", "CHOCDF"],
                      ["Fiber (g)", "fiber", "FIBTG"],
                      ["Quantity", "qty", null],
                    ].map(([label, key, field]) => {
                      const bound = filters[key];
                      return (
                        <View style={det.row} key={key}>
                          {/* Mode toggle */}
                          <View style={det.toggleGroup}>
                            {["min", "max"].map((m) => (
                              <TouchableOpacity
                                key={m}
                                style={[
                                  det.toggleBtn,
                                  bound.mode === m && det.toggleBtnSel,
                                ]}
                                onPress={() =>
                                  setFilters((p) => ({
                                    ...p,
                                    [key]: { ...p[key], mode: m },
                                  }))
                                }
                              >
                                <Text
                                  style={
                                    bound.mode === m
                                      ? det.toggleTextSel
                                      : det.toggleText
                                  }
                                >
                                  {m.toUpperCase()}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {/* Input */}
                          <TextInput
                            placeholder={label}
                            placeholderTextColor={textcolors.lightgrey}
                            keyboardType="numeric"
                            value={bound.value}
                            onChangeText={(v) =>
                              setFilters((p) => ({
                                ...p,
                                [key]: { ...p[key], value: v },
                              }))
                            }
                            style={det.input}
                          />
                        </View>
                      );
                    })}

                    {/* {[
                      ["Calories (kcal)", "kcal", "ENERC_KCAL"],
                      ["Protein (g)", "protein", "PROCNT"],
                      ["Fat (g)", "fat", "FAT"],
                      ["Carbs (g)", "carb", "CHOCDF"],
                      ["Fiber (g)", "fiber", "FIBTG"],
                      ["Quantity", "qty", null],
                    ]}.map(([label, key, field]) => )
                    <Text style={filterModal.modalLabel}>Max Calories</Text>
                    <TextInput
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={filters.maxCalories}
                      onChangeText={(val) => setFilters({ ...filters, maxCalories: val })}
                      style={filterModal.modalInput}
                    />
                    <Text style={filterModal.modalLabel}>Max Protein</Text>
                    <TextInput
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={filters.maxProtein}
                      onChangeText={(val) => setFilters({ ...filters, maxProtein: val })}
                      style={filterModal.modalInput}
                    />
                    <Text style={filterModal.modalLabel}>Max Fat</Text>
                    <TextInput
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={filters.maxFat}
                      onChangeText={(val) => setFilters({ ...filters, maxFat: val })}
                      style={filterModal.modalInput}
                    />
                    <Text style={filterModal.modalLabel}>Max Carbohydrates</Text>
                    <TextInput
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={filters.maxCarb}
                      onChangeText={(val) => setFilters({ ...filters, maxCarb: val })}
                      style={filterModal.modalInput}
                    />
                    <Text style={filterModal.modalLabel}>Max Fiber</Text>
                    <TextInput
                      placeholder="e.g. 500"
                      keyboardType="numeric"
                      value={filters.maxFiber}
                      onChangeText={(val) => setFilters({ ...filters, maxFiber: val })}
                      style={filterModal.modalInput}
                    /> */}
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
              </Pressable>
            </View>
            
          </Modal>
        </View>
        }

        

        data={Object.entries(filteredGroupedPantry)}
        keyExtractor={(item, index) => item[0]}
        renderItem={({ item }) => (
          <Category category={item[0]} ingredients={item[1]} />
        )}
        ListFooterComponent={<View style={det.space} />}
        ListEmptyComponent={
          !loading && <Text style={det.noRecipesText}>No saved pantry ingredients found.</Text>
        }
        />

      
      
      <TouchableOpacity onPress={toggleAdd}>
        {addPress ? <CancelAddButton /> : <AddButton />}
      </TouchableOpacity>

      <Animated.View 
          style={[det.buttonContainer1, animatedStyle]}
          animatedProps={animatedProps}>
        <TouchableOpacity onPress={handleSuggest}>
          <GoPantrySuggest />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
          style={[det.buttonContainer2, animatedStyle]}
          animatedProps={animatedProps}>
        <TouchableOpacity onPress={handleToGrocery}>
          <AddFromGList />
        </TouchableOpacity>
      </Animated.View>

    </View>    
  )
}

export default Pantry

const det = StyleSheet.create({
  listBox: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  box: {
      backgroundColor: colors.lightgrey,
      borderRadius: 10,
      borderColor: textcolors.lightgrey,
      borderWidth: 1,
      paddingRight: 10,
      paddingVertical: 5,
      marginBottom: 10,
    },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    marginVertical: 5, 
  },
  ingredientIcon: {
    borderRadius: 200,
    resizeMode: 'resize',
    height: 50,
    width: 50,
    marginHorizontal: 10,
  },
  leftcontain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  space: {
    marginTop: 120,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 15,
    borderColor: textcolors.blue,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#10386D',
    borderRadius: 150,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer1: {
    position: 'absolute',
    bottom: 70,
    right: 20,
  },
  buttonContainer2: {
    position: 'absolute',
    bottom: 110,
    right: 20,
  },
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 15, // Space between the icon and input
  },
  noRecipesText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "#0006",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  catText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  toggleGroup: {
    flexDirection: "row",
    marginRight: 12,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 6,
  },
  toggleBtnSel: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  toggleTextSel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 8,
    fontFamily: fonts.regular,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.othergrey,
  },
  applyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
})