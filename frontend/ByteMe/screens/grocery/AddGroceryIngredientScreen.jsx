import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  StyleSheet
} from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import { styles } from '@/components/Sheet';


function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Grocery</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}


const AddGroceryIngredientScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Query the Edamam Food Database API for ingredients
  const searchIngredients = async () => {
    setLoading(true);
    try {
      const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
      const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;
      if (!API_ID || !API_KEY) {
        console.error("Missing API credentials");
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser`,
        {
          params: {
            app_id: API_ID,
            app_key: API_KEY,
            ingr: searchQuery,
          },
          timeout: 10000,
        }
      );
      const foodData = response.data.hints.map((hint) => {
        const food = hint.food;
        return {
          foodId: food.foodId,
          label: food.label,
          category: food.category,
          image: food.image || "https://via.placeholder.com/150",
          nutrients: food.nutrients,
        };
      });
      setResults(foodData);
    } catch (err) {
      console.error("Error searching ingredients:", err.message);
      Alert.alert("Error", "Could not search for ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = async (ingredient) => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        return;
      }
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/update-grocery`,
        {
          foodId: ingredient.foodId,
          label: ingredient.label,
          quantity: quantity,
        }
      );
      if (response.status === 200) {
        Alert.alert("Success!", "Ingredient added to your grocery list!");
        navigation.navigate('grocery');
      }
    } catch (err) {
      console.error("Error adding grocery ingredient:", err.message);
      Alert.alert("Error", "Could not add the ingredient. Please try again.");
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={addDet.resultItem}
      onPress={() => addIngredient(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={addDet.ingredientIcon}
      />
      <View style={addDet.resultTextContainer}>
        <Text style={addDet.label}>{item.label}</Text>
        <Text style={addDet.category}>{item.category}</Text>
      </View>
      <View style={addDet.quantityContainer}>
        <Text style={addDet.quantityText}>x {quantity}</Text>
      </View>
    </TouchableOpacity>
  );

  //just a back button to return to Grocery
  const handleGoBack = () => {
    navigation.navigate('grocery');
  };

  return (
    <View style={stylesContainer.container}>
      <BackButton />

      <TextInput
        style={stylesContainer.searchInput}
        placeholder="Search ingredient..."
        placeholderTextColor={textcolors.darkgrey}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity
        style={stylesContainer.searchButton}
        onPress={searchIngredients}
      >
        <Text style={stylesContainer.buttonText}>Search</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.foodId}
        renderItem={renderResult}
        ListEmptyComponent={
          !loading && (
            <Text style={stylesContainer.noResultsText}>No ingredients found.</Text>
          )
        }
      />
    </View>
  );
};

export default AddGroceryIngredientScreen;

const stylesContainer = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: textcolors.darkgrey,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  noResultsText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
  },
});

const addDet = StyleSheet.create({
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  ingredientIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  resultTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  category: {
    fontSize: 14,
    color: textcolors.darkgrey,
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
