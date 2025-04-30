import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import getUserIdFromToken from '@/components/getUserIdFromToken';

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Add Goals</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function CalorieGoalScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [minCalories, setMinCalories] = useState('12000');
  const [maxCalories, setMaxCalories] = useState('15000');

  useEffect(() => {
    async function fetchUserId() {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    }
    fetchUserId();
  }, []);

  const handleAddGoal = async () => {
    try {
      if (!userId) {
        console.warn("User ID not loaded.");
        return;
      }

      const parsedMin = parseInt(minCalories, 10) || 0;
      const parsedMax = parseInt(maxCalories, 10) || 0;

      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            calories: {
              min: parsedMin,
              max: parsedMax,
              current: 0
            }
          }
        })
      });

      Alert.alert('Success', 'Calorie Intake Goal added!');
      navigation.navigate('add_goals', { userId }); // if the next screen needs it
    } catch (error) {
      console.error('Error setting calorie goal:', error);
      Alert.alert('Error', 'Could not set calorie goal.');
    }
  };

  return (
    <View style={det.container}>
      <BackButton />
      <Text style={styles.title}>Calorie Intake Goal</Text>

      {/* Visual bar */}
      <View style={det.calorieBar}>
        <View style={det.calorieLow} />
        <View style={det.calorieMid} />
        <View style={det.calorieHigh} />
      </View>
      <View style={det.calorieLabels}>
        <Text>{minCalories}</Text>
        <Text>{maxCalories}</Text>
      </View>

      <Text style={det.question}>
        What is the lowest number of calories you’d like to eat in a week?
      </Text>
      <TextInput
        style={det.input}
        keyboardType="numeric"
        value={minCalories}
        onChangeText={setMinCalories}
      />

      <Text style={det.question}>
        What is the highest number of calories you’d like to eat in a week?
      </Text>
      <TextInput
        style={det.input}
        keyboardType="numeric"
        value={maxCalories}
        onChangeText={setMaxCalories}
      />

      <TouchableOpacity
        style={[det.addButton, !userId && { opacity: 0.5 }]}
        onPress={handleAddGoal}
        disabled={!userId}
      >
        <Text style={det.addButtonText}>Add Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const det = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  calorieBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  calorieLow: {
    flex: 1,
    backgroundColor: '#B93E3E',
  },
  calorieMid: {
    flex: 1,
    backgroundColor: '#7EB77F',
  },
  calorieHigh: {
    flex: 1,
    backgroundColor: '#B93E3E',
  },
  calorieLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#A9BCD0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#133E7C',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
