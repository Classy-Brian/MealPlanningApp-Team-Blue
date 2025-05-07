import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, StyleSheet
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png"
import maglass from "@/assets/images/magnifyingglass.png"


function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Back</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const SavedRecipesDupi = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedDate, selectedTime } = route.params || {};

  const [query, setQuery] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      setLoading(true);
      try {
        const userId = await getUserIdFromToken();
        const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-recipes`);
        setSavedRecipes(res.data.savedRecipes || []);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load saved recipes.');
      } finally {
        setLoading(false);
      }
    };
    fetchSavedRecipes();
  }, []);

  const toggleSelectRecipe = (recipe) => {
    const exists = selectedRecipes.find(r => r.uri === recipe.uri);
    if (exists) {
      setSelectedRecipes(prev => prev.filter(r => r.uri !== recipe.uri));
    } else {
      setSelectedRecipes(prev => [
        ...prev,
        {
          label: recipe.label,
          uri: recipe.uri,
          calories: recipe.calories || 0,
          imageUri: recipe.image || '',
          ingredients: recipe.ingredients || [],
          directions: recipe.directions || '',
          allergies: recipe.allergies || [],
          nutrition: recipe.nutrition || {},
          selectedDate,
          selectedTime,
        }
      ]);
    }
  };

  const confirmSelection = () => {
    navigation.navigate('addday', { selectedRecipes });
  };

  return (
    <SafeAreaView style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <BackButton />

        {/* Title */}
        <Text style={styles.title}>Saved Recipes</Text>

        {/* Search Input */}
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
        {/* <TextInput
          placeholder="Search recipes..."
          placeholderTextColor={textcolors.lightgrey}
          style={det.input}
          value={query}
          onChangeText={(text) => setQuery(text)}
        /> */}

        {/* Recipes List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={savedRecipes.filter(recipe =>
              recipe.label.toLowerCase().includes(query.toLowerCase())
            )}
            keyExtractor={(item) => item.uri}
            ListFooterComponent={<View style={{marginBottom: 100}} />}
            renderItem={({ item }) => {
              const isSelected = selectedRecipes.find(r => r.uri === item.uri);
              return (
                <TouchableOpacity
                  style={[det.recipeCard, isSelected && det.selectedCard]}
                  onPress={() => toggleSelectRecipe(item)}
                >
                  <Image source={{ uri: item.image }} style={det.recipeImage} />
                  <Text style={det.recipeLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Confirm Button */}
        {selectedRecipes.length > 0 && (
          <TouchableOpacity style={det.confirmButton} onPress={confirmSelection}>
            <Text style={det.confirmButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Back Button */}
      
    </SafeAreaView>
  );
};

const det = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7E2F1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1F508F',
    marginLeft: 5,
    fontWeight: '600',
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.primary },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 10,
  },
  recipeCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
  },
  selectedCard: { backgroundColor: '#cde0fc' },
  recipeImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 8 },
  recipeLabel: { fontWeight: 'bold', color: '#1F508F' },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold' },
  magnifyingGlassIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 15, // Space between the icon and input
  },
});

export default SavedRecipesDupi;
