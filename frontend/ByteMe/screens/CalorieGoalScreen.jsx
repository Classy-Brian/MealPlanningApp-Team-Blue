import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CalorieGoalScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [minCalories, setMinCalories] = useState('12000');
  const [maxCalories, setMaxCalories] = useState('15000');

  const handleAddGoal = async () => {
    try {
      const parsedMin = parseInt(minCalories, 10) || 0;
      const parsedMax = parseInt(maxCalories, 10) || 0;

      await fetch(`http://192.168.4.66:5005/api/users/${userId}`, {
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
      router.back(); // Go back to profile or addgoals screen
    } catch (error) {
      console.error('Error setting calorie goal:', error);
      Alert.alert('Error', 'Could not set calorie goal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Intake Goal</Text>

      {/* Visual bar */}
      <View style={styles.calorieBar}>
        <View style={styles.calorieLow} />
        <View style={styles.calorieMid} />
        <View style={styles.calorieHigh} />
      </View>
      <View style={styles.calorieLabels}>
        <Text>{minCalories}</Text>
        <Text>{maxCalories}</Text>
      </View>

      <Text style={styles.question}>
        What is the lowest number of calories you’d like to eat in a week?
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minCalories}
        onChangeText={setMinCalories}
      />

      <Text style={styles.question}>
        What is the highest number of calories you’d like to eat in a week?
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={maxCalories}
        onChangeText={setMaxCalories}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
        <Text style={styles.addButtonText}>Add Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
