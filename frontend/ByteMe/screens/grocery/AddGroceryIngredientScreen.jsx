// frontend/ByteMe/screens/grocery/AddGroceryIngredientScreen.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Divider } from "react-native-paper";

import { colors } from "@/components/Colors";
import { textcolors } from "@/components/TextColors";
import { fonts } from "@/components/Fonts";
import { styles } from "@/components/Sheet";
import getUserIdFromToken from "@/components/getUserIdFromToken";

import backarrow from "@/assets/images/back_arrow_navigate.png";
import maglass from "@/assets/images/magnifyingglass.png";

const STORAGE_KEY = "@recentGroceryQueries";

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <View style={styles.greybutton}>
        <Image source={backarrow} style={{ marginRight: 10 }} />
        <Text style={styles.regularText}>Grocery</Text>
      </View>
    </TouchableOpacity>
  );
};

const AddGroceryIngredientScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //Batch‑add setup

  const initialBatch =
    route.params?.batch ?? // direct push
    route.params?.params?.batch ?? // nested push through tab navigator
    [];
  const [batchQueue, setBatchQueue] = useState(initialBatch);

  // Core state
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Recent searches
  const [recent, setRecent] = useState([]);

  // Filter modal
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bounds, setBounds] = useState({
    kcal: { mode: "max", value: "" },
    protein: { mode: "max", value: "" },
    fat: { mode: "max", value: "" },
    carb: { mode: "max", value: "" },
    fiber: { mode: "max", value: "" },
  });

  // Load “recent” from storage
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    })();
  }, []);

  const pushRecent = async (q) => {
    if (!q.trim()) return;
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, 5);
    setRecent(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // If we have a batch, kick off the first search on mount
  useEffect(() => {
    if (initialBatch.length > 0) {
      const first = initialBatch[0];
      setSearchQuery(first);
      searchIngredients(false, first);
    }
  }, []);

  //API search
  const searchIngredients = async (recordRecent = true, overrideQuery) => {
    const q = overrideQuery ?? searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
      const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;
      const { data } = await axios.get(
        "https://api.edamam.com/api/food-database/v2/parser",
        {
          params: { app_id: API_ID, app_key: API_KEY, ingr: q },
          timeout: 10000,
        }
      );
      const list = data.hints.map((h) => ({
        foodId: h.food.foodId,
        label: h.food.label,
        category: h.food.category || "Other",
        image: h.food.image || "https://via.placeholder.com/150",
        nutrients: h.food.nutrients || {},
      }));
      setResults(list);
      if (recordRecent) pushRecent(q);
    } catch (err) {
      console.error("search", err);
      Alert.alert("Error", "Could not search for ingredients.");
    } finally {
      setLoading(false);
    }
  };

  // Add / batch‑advance logic
  const addIngredient = async (item) => {
    try {
      const userId = await getUserIdFromToken();
      await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/update-grocery`,
        { foodId: item.foodId, label: item.label, quantity }
      );

      // If in batch, move to next
      if (batchQueue.length > 0) {
        const [, ...rest] = batchQueue;
        if (rest.length > 0) {
          setBatchQueue(rest);
          const next = rest[0];
          setSearchQuery(next);
          searchIngredients(false, next);
        } else {
          Alert.alert("All done!", "Added every selected ingredient.");
          navigation.navigate("grocery");
        }
      } else {
        Alert.alert("Success", "Ingredient added to your grocery list!");
        navigation.navigate("grocery");
      }
    } catch (err) {
      console.error("add", err);
      Alert.alert("Error", "Could not add the ingredient.");
    }
  };

  // Filtering helpers & derived data
  const allCategories = [...new Set(results.map((r) => r.category))];

  const checkBound = (num, b) => {
    const v = b.value.trim();
    if (!v) return true;
    if (isNaN(+v)) return false;
    return b.mode === "max" ? num <= +v : num >= +v;
  };

  const filteredResults = results.filter((r) => {
    const n = r.nutrients || {};
    const catOk =
      !selectedCategories.length || selectedCategories.includes(r.category);
    const nutrOk =
      checkBound(n.ENERC_KCAL || 0, bounds.kcal) &&
      checkBound(n.PROCNT || 0, bounds.protein) &&
      checkBound(n.FAT || 0, bounds.fat) &&
      checkBound(n.CHOCDF || 0, bounds.carb) &&
      checkBound(n.FIBTG || 0, bounds.fiber);
    const textOk = r.label.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && nutrOk && textOk;
  });

  const resetFilters = () => {
    setSelectedCategories([]);
    setBounds({
      kcal: { mode: "max", value: "" },
      protein: { mode: "max", value: "" },
      fat: { mode: "max", value: "" },
      carb: { mode: "max", value: "" },
      fiber: { mode: "max", value: "" },
    });
  };

  // UI chip for recent searches
  const Chip = ({ text }) => (
    <TouchableOpacity
      onPress={() => {
        setSearchQuery(text);
        searchIngredients(false, text);
      }}
      style={ui.chip}
    >
      <Text style={ui.chipText}>{text}</Text>
    </TouchableOpacity>
  );

  // Render
  return (
    <SafeAreaView style={ui.container}>
      <BackButton />

      {/* Search & Filter */}
      <View style={{ marginVertical: 10 }}>
        <View style={styles.searchInput}>
          <Image source={maglass} style={ui.magnifyingGlassIcon} />
          <TextInput
            placeholder="Search for groceries"
            placeholderTextColor={textcolors.darkgrey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.regularText}
            onSubmitEditing={() => searchIngredients()}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterOpen(true)}
        >
          <MaterialIcons
            name="filter-list"
            size={24}
            color={textcolors.darkgrey}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.regularText}>Filter</Text>
        </TouchableOpacity>
      </View>
      <Divider />

      {/* Recent search chips */}
      {recent.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ui.chipsContainer}
        >
          {recent.map((q) => (
            <Chip key={q} text={q} />
          ))}
        </ScrollView>
      )}

      {/* Loading spinner */}
      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      {/* Results list */}
      <FlatList
        contentContainerStyle={{ paddingTop: 12 }}
        data={filteredResults}
        keyExtractor={(i) => i.foodId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={ui.resultItem}
            onPress={() => addIngredient(item)}
          >
            <Image source={{ uri: item.image }} style={ui.image} />
            <View style={{ flex: 1 }}>
              <Text style={ui.label}>{item.label}</Text>
              <Text style={ui.cat}>{item.category}</Text>
            </View>
            <Text style={ui.qty}>x {quantity}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && <Text style={ui.noRes}>No ingredients found.</Text>
        }
      />

      {/* Filter Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={filterOpen}
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable style={modal.backdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={modal.sheet}>
            <ScrollView>
              <Text style={modal.title}>Filter Search Results</Text>

              <Text style={modal.label}>Categories</Text>
              {allCategories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={modal.catRow}
                  onPress={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                >
                  <Ionicons
                    name={
                      selectedCategories.includes(c)
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={modal.catText}>{c}</Text>
                </TouchableOpacity>
              ))}

              <Text style={modal.label}>Nutrient Bounds (per 100 g)</Text>
              {[
                ["Calories (kcal)", "kcal"],
                ["Protein (g)", "protein"],
                ["Fat (g)", "fat"],
                ["Carbs (g)", "carb"],
                ["Fiber (g)", "fiber"],
              ].map(([lbl, key]) => {
                const b = bounds[key];
                return (
                  <View style={modal.row} key={key}>
                    <View style={modal.toggleGroup}>
                      {["min", "max"].map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[
                            modal.toggle,
                            b.mode === m && modal.toggleSel,
                          ]}
                          onPress={() =>
                            setBounds((p) => ({
                              ...p,
                              [key]: { ...p[key], mode: m },
                            }))
                          }
                        >
                          <Text
                            style={
                              b.mode === m
                                ? modal.toggleTextSel
                                : modal.toggleText
                            }
                          >
                            {m.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      placeholder={lbl}
                      placeholderTextColor={textcolors.lightgrey}
                      keyboardType="numeric"
                      value={b.value}
                      onChangeText={(v) =>
                        setBounds((p) => ({
                          ...p,
                          [key]: { ...p[key], value: v },
                        }))
                      }
                      style={modal.input}
                    />
                  </View>
                );
              })}

              <View style={modal.actions}>
                <TouchableOpacity style={modal.resetBtn} onPress={resetFilters}>
                  <Text style={styles.regularText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={modal.applyBtn}
                  onPress={() => setFilterOpen(false)}
                >
                  <Text style={styles.regularText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default AddGroceryIngredientScreen;

/*  Styles  */
const ui = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 15 },
  magnifyingGlassIcon: { width: 30, height: 30, marginHorizontal: 15 },
  chipsContainer: {
    height: 40,
    alignItems: "center",
    paddingRight: 10,
    marginBottom: 10,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.othergrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  chipText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: textcolors.lightgrey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  label: { fontSize: 18, fontFamily: fonts.medium },
  cat: { fontSize: 14, color: textcolors.darkgrey },
  qty: { fontSize: 16, fontFamily: fonts.bold },
  noRes: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
  },
});

const modal = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#0006", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  title: { fontFamily: fonts.semiBold, fontSize: 22, marginBottom: 10 },
  label: { fontFamily: fonts.medium, fontSize: 16, marginVertical: 10 },
  catRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  catText: { marginLeft: 10, fontFamily: fonts.regular, fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  toggleGroup: { flexDirection: "row", marginRight: 12 },
  toggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 6,
  },
  toggleSel: { backgroundColor: colors.primary },
  toggleText: {
    fontSize: 12,
    color: colors.primary,
    fontFamily: fonts.regular,
  },
  toggleTextSel: { fontSize: 12, color: colors.white, fontFamily: fonts.bold },
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
    marginTop: 15,
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
});
