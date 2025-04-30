import { Image, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '@/components/Sheet'
import { Divider } from 'react-native-paper'
import { textcolors } from '@/components/TextColors'
import { colors } from '@/components/Colors'
import { fonts } from '@/components/Fonts'
import chright from "@/assets/images/chevron_right.png"
import getUserIdFromToken from '@/components/getUserIdFromToken'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { Checkbox } from 'react-native-paper'


function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[det.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Pantry</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const SingleIngredient = ({ ingredient, onSelect, selected }) => {
  // console.log("Single ingredient being passed:", ingredient);  // checks what data is passed as ingredient

  return(
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Checkbox 
        status={selected ? 'checked' : 'unchecked'}
        onPress={() => onSelect(ingredient)}
        color={colors.header}      />
      <View style={det.box}>
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
      </View>                         
    </View>
    </View>
    
  )
}

const Category = ({ category, ingredients, filteredPantry, selectedIngredients, toggleSelection }) => {
  // console.log("Ingredients being passed into Category:", ingredients)
  return(
    <View style={{marginHorizontal: 15}}> 
      <Text style={det.heading}>{category}</Text>
      <FlatList
        data={ingredients}
        keyExtractor={( item, index ) => item.foodId ? item.foodId.toString() : `item-${index}`}
        renderItem={({ item }) => (
          <SingleIngredient 
            ingredient={item}
            selected={selectedIngredients.includes(item)}
            onSelect={toggleSelection} />
        )}
      />
      <Divider />
    </View>
  )
}


const AddingGroceryToPantry = () => {
  const [query, setQuery] = useState('');
  const [savedGrocery, setSavedGrocery] = useState([]);
  const [groupedPantry, setGroupedPantry] = useState({});
  const [loading, setLoading] = useState(false);
  const [ingrLabels, setIngrLabels] = useState([]);
  const [clearEnabled, setClearEnabled] = useState(false)

  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [savedPantry, setSavedPantry] = useState([])

  const navigation = useNavigation()


  const fetchSavedGrocery = async () => {
    setLoading(true);
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-grocery`
      );
      
      if (!response.data || !response.data.savedGrocery || response.data.savedGrocery.length === 0) {
        console.warn("No saved pantry ingredients found.");
        setSavedGrocery([]);
        setLoading(false);
        return;
      }

      const groupedData = response.data.savedGrocery.reduce((acc, ingredient) => {
        const category = ingredient.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(ingredient);
        return acc;
      }, {});
      setGroupedPantry(groupedData);
      // console.log("Grouped data: ", groupedData)
      setSavedGrocery(response.data.savedGrocery);
    } catch (err) {
      console.error("Error fetching saved pantry ingredients:", err);
      setError("Failed to load saved pantry ingredients.");
      Alert.alert("Error!", "Could not load user's saved grocery ingredients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedGrocery()
  }, []);

  useEffect(() => {
    if (savedGrocery.length > 0) {
      setIngrLabels(savedGrocery.map(ingredient => ingredient.label))
    } else {
      setIngrLabels([])
    };
  }, [savedGrocery])

  useEffect(() => {
    setClearEnabled(selectedIngredients.length > 0)
  }, [selectedIngredients])

  const toggleSelection = (ingredient) => {
    setSelectedIngredients((prevSelected) => {
      const alreadySelected = prevSelected.some(item => item.foodId === ingredient.foodId)
      return alreadySelected ? prevSelected.filter((item) => item.foodId !== ingredient.foodId) : [...prevSelected, ingredient]
    })
  }

  const toggleSelectionAll = () => {
    if (savedGrocery.length > 0) {
      setSelectedIngredients(savedGrocery)
    }
  }

  const toggleClear = () => {
    if (savedGrocery.length > 0) {
      setSelectedIngredients([])
    }
  }

  const ClearButton = () => {
    return (
      <View style={[det.greybutton, {backgroundColor: colors.grey}]}>          
          <Text style={[styles.regularText, {color: clearEnabled ? colors.dark : colors.lightgrey}]}>
              Clear
          </Text>
      </View>
    )
  }

  
  const handleAddToPantry = async () => {
    
    if (selectedIngredients.length === 0) {
      Alert.alert("No ingredients are currently selected!","Please select ingredients to add to your pantry.")
      return
    }
    console.log("Adding ingredients to pantry . . . ")

    try {
      const userId = await getUserIdFromToken()
      const length = selectedIngredients.length

      const ingredientsToAdd = selectedIngredients.map(ingredient => ({
        foodId: ingredient.foodId,
        quantity: ingredient.quantity
      }))

      console.log("Ingredients to add:", ingredientsToAdd)

      await Promise.all(
        ingredientsToAdd.map(async (ingredient) => {
          await axios.put(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/update-pantry`, ingredient)
        }
      ))

      console.log("Added ingredients to pantry!")

      console.log("Now removing ingredients from grocery")

      const foodIdsToRemove = ingredientsToAdd.map(ingredient => ingredient.foodId)

      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/batch-remove-grocery`, {
            data: {foodIds: foodIdsToRemove}
        }
      )

      console.log("Batch delete response:", response.data)

      console.log("Removed ingredients from grocery!")

        setSelectedIngredients([])
        Alert.alert("Success!", `Added ${length} ingredients to the pantry!`)
        navigation.navigate('pantry1')
    } catch (err) {
      console.error("Error adding ingredients from grocery to pantry", err)
      Alert.alert("Error!", "Could not add ingredients to pantry")
    }
  }


  const filteredGroupedPantry = Object.entries(groupedPantry).reduce((acc, [category, ingredients]) => {
    const filteredIngredients = ingredients.filter( ingredient => 
      ingredient.label.toLowerCase().includes(query.toLowerCase())
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
            <BackButton />
            <Text style={styles.title}>Adding To Pantry</Text>

          <Divider />

          {loading && <ActivityIndicator size="large" color={colors.primary} />}
        </View>
        }

        

        data={Object.entries(filteredGroupedPantry)}
        keyExtractor={(item, index) => item[0]}
        renderItem={({ item }) => (
          <Category 
            category={item[0]} 
            ingredients={item[1]}
            selectedIngredients={selectedIngredients}
            toggleSelection={toggleSelection} />
        )}
        ListFooterComponent={<View style={det.space} />}
        ListEmptyComponent={
          !loading && <Text style={det.noRecipesText}>No saved grocery ingredients found.</Text>
        }
        />
        <View style={[det.boxContainer, {paddingHorizontal: 20}]}>
            <TouchableOpacity 
              disabled={!clearEnabled}
              onPress={toggleClear}>
              <ClearButton />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[det.greybutton, {backgroundColor: colors.othergrey}]}
              onPress={toggleSelectionAll}>
                <Text style={styles.regularText}>
                    Select All
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[det.greybutton,{backgroundColor: colors.primary}]}
              onPress={handleAddToPantry} >
                <Text style={styles.regularText}>
                    Add to Pantry
                </Text>
            </TouchableOpacity>
        </View>
        
    </View>    
  )
}

export default AddingGroceryToPantry

const det = StyleSheet.create({
  listBox: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  box: {
      flex: 1,
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
    justifyContent: 'center',
  },
  space: {
    marginTop: 30,
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
})