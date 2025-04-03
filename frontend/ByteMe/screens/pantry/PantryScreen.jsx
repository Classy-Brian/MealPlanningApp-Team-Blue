import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { styles } from '@/components/Sheet'
import { Divider } from 'react-native-paper'
import { textcolors } from '@/components/TextColors'
import { colors } from '@/components/Colors'
import { Ionicons } from '@expo/vector-icons'
import { fonts } from '@/components/Fonts'
import { useRouter } from 'expo-router'
import maglass from "@/assets/images/magnifyingglass.png"
import chright from "@/assets/images/chevron_right.png"
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import getUserIdFromToken from '@/components/getUserIdFromToken'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'

const SingleIngredient = ({ ingredient }) => {
  // console.log("Single ingredient being passed:", ingredient);  // checks what data is passed as ingredient
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('edit_pantry', {ingredient})
  }

  return(
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
        <TouchableOpacity onPress={handlePress}>
          <Image source={chright}/>
        </TouchableOpacity>
      </View>                         
    </View>
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

function Filter() {
  return(
    <View>
      <TouchableOpacity style={det.button}>
        <Text style={styles.regularText}>Category</Text>
      </TouchableOpacity>
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

  const [addPress, setAddPress] = useState(false);

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
    fetchSavedPantry();
  }, []);

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
      navigation.navigate('pantry_suggest')
    } else {
      return
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
          <Divider />

          {loading && <ActivityIndicator size="large" color={colors.primary} />}
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
        <TouchableOpacity>
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
    marginTop: 100,
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
})