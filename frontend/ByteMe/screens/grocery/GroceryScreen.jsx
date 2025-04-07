//frontend/ByteMe/screens/grocery/GroceryScreen.jsx
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { styles } from '@/components/Sheet';
import { Divider } from 'react-native-paper';
import { textcolors } from '@/components/TextColors';
import { colors } from '@/components/Colors';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/components/Fonts';
import maglass from "@/assets/images/magnifyingglass.png";
import chright from "@/assets/images/chevron_right.png";
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const SingleGroceryItem = ({ item }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('editgroceryingredient', { ingredient: item });
  };

  return (
    <View style={det.box}>
      <View style={det.boxContainer}>
        <View style={det.leftcontain}>
          <Image
            style={det.ingredientIcon}
            source={{
              uri: item?.image || "https://via.placeholder.com/150",
            }}
          />
          <View>
            <Text style={styles.regText16}>{item?.label}</Text>
            <Text style={styles.regText16}>x {item?.quantity}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handlePress}>
          <Image source={chright} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Category = ({ category, items }) => {
  return (
    <View style={{ marginHorizontal: 15 }}>
      <Text style={det.heading}>{category}</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.foodId || index.toString()}
        renderItem={({ item }) => <SingleGroceryItem item={item} />}
      />
      <Divider />
    </View>
  );
};

function AddButton() {
  return (
    <View style={styles.addButton}>
      <Ionicons name="add" size={60} color="#d9d9d9" />
    </View>
  );
}

const GroceryScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [savedGrocery, setSavedGrocery] = useState([]);
  const [groupedGrocery, setGroupedGrocery] = useState({});
  const [loading, setLoading] = useState(false);

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
      console.log("Grocery API response:", response.data);
      if (!response.data || !response.data.savedGrocery || response.data.savedGrocery.length === 0) {
        console.warn("No saved grocery ingredients found.");
        setSavedGrocery([]);
        setLoading(false);
        return;
      }
      // Group data similarly to the pantry screen
      const groupedData = response.data.savedGrocery.reduce((acc, item) => {
        const category = item.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {});
      setGroupedGrocery(groupedData);
      setSavedGrocery(response.data.savedGrocery);
    } catch (err) {
      console.error("Error fetching saved grocery ingredients:", err);
      Alert.alert("Error!", "Could not load saved grocery ingredients.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedGrocery();
    }, [])
  );

  // Directly navigate to add screen when the add button is pressed.
  const handleAddGrocery = () => {
    navigation.navigate('addgroceryingredient');
  };

  // Filter grouped items by query
  const filteredGroupedGrocery = Object.entries(groupedGrocery).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  return (
    <View style={styles.whiteBackground}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.screenContainer}>
            <Text style={styles.title}>Grocery</Text>
            {/* Search Box */}
            <View style={styles.searchInput}>
              <Image style={det.magnifyingGlassIcon} source={maglass} />
              <TextInput
                placeholder="Search for ingredients"
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
        data={Object.entries(filteredGroupedGrocery)}
        keyExtractor={(item, index) => item[0]}
        renderItem={({ item }) => (
          <Category category={item[0]} items={item[1]} />
        )}
        ListFooterComponent={<View style={det.space} />}
        ListEmptyComponent={
          !loading && <Text style={det.noRecipesText}>No saved grocery ingredients found.</Text>
        }
      />

      <TouchableOpacity onPress={handleAddGrocery}>
        <AddButton />
      </TouchableOpacity>
    </View>
  );
};

export default GroceryScreen;

const det = StyleSheet.create({
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
    resizeMode: 'cover',
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
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 15,
  },
  noRecipesText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
  },
});
