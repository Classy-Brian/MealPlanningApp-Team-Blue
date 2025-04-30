// frontend/ByteMe/screens/grocery/GroceryScreen.jsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Divider } from "react-native-paper";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { styles } from "@/components/Sheet";
import { colors } from "@/components/Colors";
import { textcolors } from "@/components/TextColors";
import { fonts } from "@/components/Fonts";
import maglass from "@/assets/images/magnifyingglass.png";
import chright from "@/assets/images/chevron_right.png";
import getUserIdFromToken from "@/components/getUserIdFromToken";

const GroceryScreen = () => {
  const navigation = useNavigation();

  /* Core data state */
  const [saved, setSaved] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* Filter modal state */
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // multi-select
  const [bounds, setBounds] = useState({
    kcal: { mode: "max", value: "" },
    protein: { mode: "max", value: "" },
    fat: { mode: "max", value: "" },
    carb: { mode: "max", value: "" },
    fiber: { mode: "max", value: "" },
    qty: { mode: "max", value: "" },
  });

  /* Fetch grocery on focus */
  const fetchSavedGrocery = async () => {
    setLoading(true);
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-grocery`
      );
      const list = res.data.savedGrocery || [];
      setSaved(list);
      const g = list.reduce((acc, ing) => {
        const cat = ing.category || "Other";
        (acc[cat] = acc[cat] || []).push(ing);
        return acc;
      }, {});
      setGrouped(g);
    } catch (e) {
      console.error("fetch grocery", e);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(useCallback(fetchSavedGrocery, []));

  /* Category list */
  const allCategories = [
    "Other",
    ...new Set(saved.map((i) => i.category || "Other")),
  ];

  /* Filter helpers */
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const resetFilters = () => {
    setSelectedCategories([]);
    setBounds({
      kcal: { mode: "max", value: "" },
      protein: { mode: "max", value: "" },
      fat: { mode: "max", value: "" },
      carb: { mode: "max", value: "" },
      fiber: { mode: "max", value: "" },
      qty: { mode: "max", value: "" },
    });
  };

  /* Filtering logic */
  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, arr]) => {
    const keep = arr.filter((ing) => {
      const n = ing.nutrients || {};
      const textMatch = ing.label.toLowerCase().includes(query.toLowerCase());
      const catMatch =
        !selectedCategories.length || selectedCategories.includes(cat);

      const checkBound = (field, boundObj) => {
        const v = boundObj.value.trim();
        if (!v) return true;
        if (isNaN(+v)) return false;
        return boundObj.mode === "max"
          ? (n[field] || 0) <= +v
          : (n[field] || 0) >= +v;
      };

      const nutrMatch =
        checkBound("ENERC_KCAL", bounds.kcal) &&
        checkBound("PROCNT", bounds.protein) &&
        checkBound("FAT", bounds.fat) &&
        checkBound("CHOCDF", bounds.carb) &&
        checkBound("FIBTG", bounds.fiber);

      const qtyMatch = (() => {
        const b = bounds.qty;
        const v = b.value.trim();
        if (!v) return true;
        if (isNaN(+v)) return false;
        return b.mode === "max" ? ing.quantity <= +v : ing.quantity >= +v;
      })();

      return textMatch && catMatch && nutrMatch && qtyMatch;
    });

    if (keep.length) acc[cat] = keep;
    return acc;
  }, {});

  /* Render category section */
  const CategoryBlock = ({ category, items }) => (
    <View style={{ marginHorizontal: 15 }}>
      <Text style={det.heading}>{category}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.foodId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={det.itemRow}
            onPress={() =>
              navigation.navigate("editgroceryingredient", { ingredient: item })
            }
          >
            <View style={det.rowLeft}>
              <Image source={{ uri: item.image }} style={det.image} />
              <View>
                <Text style={styles.regText16}>{item.label}</Text>
                <Text style={styles.regText16}>x {item.quantity}</Text>
              </View>
            </View>
            <Image source={chright} />
          </TouchableOpacity>
        )}
      />
      <Divider />
    </View>
  );

  return (
    <View style={styles.whiteBackground}>
      {/* Header & Search */}
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Grocery</Text>
        <View style={styles.searchInput}>
          <Image source={maglass} style={det.magIcon} />
          <TextInput
            placeholder="Search for ingredients"
            placeholderTextColor={textcolors.darkgrey}
            style={styles.regularText}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        {/* Pantry-style Filter Button */}
        <TouchableOpacity
          style={det.filterButton}
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
        <Divider />
        {loading && <ActivityIndicator size="large" color={colors.primary} />}
      </View>

      {/* Grocery List */}
      <FlatList
        data={Object.entries(filteredGrouped)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <CategoryBlock category={item[0]} items={item[1]} />
        )}
        ListEmptyComponent={
          !loading && (
            <Text style={det.noData}>No items match your filter.</Text>
          )
        }
      />

      {/* Add FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("addgroceryingredient")}
      >
        <Ionicons name="add" size={60} color="#d9d9d9" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable style={modal.backdrop} onPress={() => setFilterOpen(false)}>
          <Pressable style={modal.sheet}>
            <ScrollView>
              <Text style={modal.title}>Filter Grocery</Text>

              {/* Categories */}
              <Text style={modal.label}>Categories</Text>
              {allCategories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={modal.catRow}
                  onPress={() => toggleCategory(c)}
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

              {/* Nutrient & Quantity bounds */}
              {[
                ["Calories (kcal)", "kcal", "ENERC_KCAL"],
                ["Protein (g)", "protein", "PROCNT"],
                ["Fat (g)", "fat", "FAT"],
                ["Carbs (g)", "carb", "CHOCDF"],
                ["Fiber (g)", "fiber", "FIBTG"],
                ["Quantity", "qty", null],
              ].map(([label, key, field]) => {
                const bound = bounds[key];
                return (
                  <View style={modal.row} key={key}>
                    {/* Mode toggle */}
                    <View style={modal.toggleGroup}>
                      {["min", "max"].map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[
                            modal.toggleBtn,
                            bound.mode === m && modal.toggleBtnSel,
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
                              bound.mode === m
                                ? modal.toggleTextSel
                                : modal.toggleText
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

              {/* Actions */}
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
    </View>
  );
};

/* Styles */
const det = StyleSheet.create({
  heading: { fontSize: 24, fontFamily: fonts.semiBold, marginVertical: 5 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  magIcon: { width: 30, height: 30, marginHorizontal: 15 },
  noData: {
    textAlign: "center",
    marginTop: 40,
    color: textcolors.lightgrey,
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#d7d9ed",
    marginVertical: 10,
    elevation: 2,
  },
});

const modal = StyleSheet.create({
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
});

export default GroceryScreen;
