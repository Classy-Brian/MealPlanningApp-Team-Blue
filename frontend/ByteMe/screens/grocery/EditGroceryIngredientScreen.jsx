//frontend/ByteMe/screens/grocery/EditGroceryIngredientScreen.jsx
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import React, { useState } from 'react';
import { styles } from '@/components/Sheet';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '@/components/Fonts';
import { useNavigation } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import axios from 'axios';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import { colors } from '@/components/Colors';
import { Divider } from 'react-native-paper';

function MinusButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={det.blueRoundButton}>
        <Ionicons name="remove" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );
}

function AddButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={det.blueRoundButton}>
        <Ionicons name="add" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );
}

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={det.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Grocery</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function UpdateIngredient({ ingredient, quantity }) {
  const navigation = useNavigation();
  const handleUpdate = async () => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        return;
      }
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/update-grocery`,
        { foodId: ingredient?.foodId, quantity }
      );
      if (response.status === 200) {
        Alert.alert("Success!", "Grocery ingredient updated successfully!");
        navigation.navigate('grocery');
      }
    } catch (err) {
      console.error("Error updating grocery ingredient:", err);
      Alert.alert("Error!", "Could not update the grocery ingredient. Please try again.");
    }
  };
  return (
    <TouchableOpacity onPress={handleUpdate}>
      <View style={det.bluebutton}>
        <Text style={styles.regularText}>Update Ingredient</Text>
      </View>
    </TouchableOpacity>
  );
}

function DeleteIngredient({ ingredient }) {
  const navigation = useNavigation();
  const handleRemove = async () => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        return;
      }
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/remove-grocery`,
        { data: { foodId: ingredient?.foodId } }
      );
      if (response.status === 200) {
        Alert.alert("Success", "Grocery ingredient successfully removed!");
        navigation.navigate('grocery');
      }
    } catch (err) {
      console.error("Error removing grocery ingredient:", err);
      Alert.alert("Error!", "Could not remove the grocery ingredient. Please try again.");
    }
  };
  return (
    <TouchableOpacity onPress={handleRemove}>
      <View style={det.redButton}>
        <Text style={styles.regularText}>Remove Ingredient</Text>
      </View>
    </TouchableOpacity>
  );
}

const EditGroceryIngredientScreen = ({ route }) => {
  const { ingredient } = route.params;
  const [quantity, setQuantity] = useState(ingredient?.quantity || 1);

  const handleMinus = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handlePlus = () => {
    setQuantity(quantity + 1);
  };

  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <BackButton />
        <Text style={styles.title}>Edit Grocery Ingredient</Text>
        <View style={det.container}>
          {/* Ingredient image and label */}
          <View style={det.rowLeft}>
            <Image style={det.foodIcon} source={{ uri: ingredient?.image }} />
            <Text style={[styles.boldfont, { marginLeft: 10 }]}>{ingredient?.label}</Text>
          </View>
          <Divider />
          <Text style={[styles.heading, { marginVertical: 10 }]}>Quantity</Text>
          <View style={det.rowMiddle}>
            <MinusButton onPress={handleMinus} />
            <Text style={[styles.regularText, { fontSize: 24, marginHorizontal: 50 }]}>
              {quantity}
            </Text>
            <AddButton onPress={handlePlus} />
          </View>
          <Divider />
          <UpdateIngredient ingredient={ingredient} quantity={quantity} />
          <DeleteIngredient ingredient={ingredient} />
        </View>
      </View>
    </View>
  );
};

export default EditGroceryIngredientScreen;

const det = StyleSheet.create({
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
  },
  bluebutton: {
    flexDirection: 'row',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    marginHorizontal: 70,
    marginTop: 25,
  },
  foodIcon: {
    width: 100,
    height: 100,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.grey,
    marginRight: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  container: {
    marginHorizontal: 15,
  },
  blueRoundButton: {
    borderRadius: 200,
    padding: 5,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    height: 40,
    width: 40,
  },
  redButton: {
    flexDirection: 'row',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,
    marginHorizontal: 70,
    marginTop: 15,
  },
});
