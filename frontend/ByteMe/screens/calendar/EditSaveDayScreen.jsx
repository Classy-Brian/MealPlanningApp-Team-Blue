import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,FlatList,Image,Alert} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import EditIcon from '@/assets/images/edit.png';

const EditSaveDayScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { date, meals } = route.params;

  const [hourlyMeals, setHourlyMeals] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [editingHour, setEditingHour] = useState(null);
  const [userId, setUserId] = useState(null);

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const suffix = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${suffix}`;
  });

  useEffect(() => {
    const map = {};
    meals.forEach((m) => {
      map[m.time] = m;
    });
    setHourlyMeals(map);
  }, [meals]);

  useEffect(() => {
    const fetchData = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${id}/get-saved-recipes`);
      const formatted = res.data.savedRecipes.map((r, i) => ({
        label: r.label,
        value: r.uri || r.id || `recipe-${i}`,
      }));
      setRecipes(formatted);
    };

    fetchData();
  }, []);

  const updateRecipeForHour = (hour, recipeId) => {
    const match = recipes.find(r => r.value === recipeId);
    setHourlyMeals(prev => ({
      ...prev,
      [hour]: {
        recipeId: recipeId,
        recipeLabel: match?.label || recipeId,
        time: hour,
      }
    }));
    setEditingHour(null);
  };

  const handleSaveDay = async () => {
    const updatedMeals = Object.values(hourlyMeals);
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/save-day`, {
        date,
        meals: updatedMeals,
        totalCalories: 0
      });

      Alert.alert("Success", "Day updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Save failed:", err?.response?.data || err.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to update day.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Meal Plan for {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
      </Text>

      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.time, styles.headerText]}>Time</Text>
        <Text style={[styles.recipeHeader, styles.headerText]}>Recipes</Text>
        <Text style={[styles.editHeader, styles.headerText]}></Text>
      </View>

      <FlatList
        data={hours}
        keyExtractor={(item) => item}
        renderItem={({ item: hour }) => {
          const meal = hourlyMeals[hour];

          return (
            <View style={styles.row}>
              <Text style={styles.time}>{hour}</Text>

              <View style={styles.recipeBox}>
                {editingHour === hour ? (
                  <DropDownPicker
                    items={recipes}
                    open={true}
                    setOpen={() => {}}
                    value={meal?.recipeId ?? null}
                    setValue={(val) => updateRecipeForHour(hour, val())}
                    placeholder="Select recipe"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropDownContainer}
                    listMode="SCROLLVIEW"
                  />
                ) : meal ? (
                  <View style={styles.recipeBubble}>
                    <Text style={styles.recipeText}>{meal.recipeLabel || meal.recipeId}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity onPress={() => setEditingHour(hour)} style={styles.iconWrapper}>
                <Image source={EditIcon} style={styles.editIcon} />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveDay}>
        <Text style={styles.saveButtonText}>Save Day</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#1F508F',
    paddingBottom: 6,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#1F508F',
  },
  recipeHeader: {
    flex: 1,
    textAlign: 'left',
  },
  editHeader: {
    width: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
  },
  time: {
    width: 80,
    fontWeight: 'bold',
  },
  recipeBox: {
    flex: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  recipeBubble: {
    backgroundColor: '#c7d6f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recipeText: {
    fontWeight: 'bold',
    color: '#1F508F',
  },
  iconWrapper: {
    paddingHorizontal: 10,
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  dropdown: {
    borderColor: "#1F508F",
    borderWidth: 1,
    borderRadius: 10,
    width: 200,
    zIndex: 999,
  },
  dropDownContainer: {
    borderColor: "#1F508F",
    borderWidth: 1,
    borderRadius: 10,
    width: 200,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#1F508F',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditSaveDayScreen;
