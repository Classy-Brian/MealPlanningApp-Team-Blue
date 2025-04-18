import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, Image, StyleSheet
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';

const SavedRecipesDupi = () => {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const userId = await getUserIdFromToken();
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-recipes`);
      const formatted = res.data.savedRecipes.map((r, i) => ({
        label: r.label,
        uri: r.uri || `recipe-${i}`,
        calories: r.calories || 0,
        image: r.image || '',
      }));
      setRecipes(formatted);
      setFiltered(formatted);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleSelect = (recipe) => {
    navigation.navigate('addday', { selectedRecipe: recipe });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick a Recipe</Text>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setFiltered(recipes.filter(r => r.label.toLowerCase().includes(text.toLowerCase())));
        }}
        placeholder="Search recipe..."
        style={styles.search}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#1F508F" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : null}
              <View style={styles.info}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.cal}>Calories: {Math.round(item.calories)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  search: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 15
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee'
  },
  image: {
    width: 60, height: 60, borderRadius: 8, marginRight: 10
  },
  info: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold' },
  cal: { color: 'gray' },
});

export default SavedRecipesDupi;
