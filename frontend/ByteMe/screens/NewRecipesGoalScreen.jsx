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

export default function NewRecipesGoalScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  const [wantToTry, setWantToTry] = useState('5');

  const handleAddGoal = async () => {
    try {
      const parsedWantToTry = parseInt(wantToTry, 10) || 0;

      await fetch(`http://192.168.1.65:5005/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            recipes: {
              tried: 0,
              wantToTry: parsedWantToTry
            }
          }
        })
      });

      Alert.alert('Success', 'New Recipes Tried Goal added!');
      router.back();
    } catch (error) {
      console.error('Error setting recipes goal:', error);
      Alert.alert('Error', 'Could not set recipes goal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Recipes Tried</Text>

      {/* Progress bar */}
      <View style={styles.recipeBar}>
        <View style={styles.recipeFill} />
      </View>
      <View style={styles.recipeLabels}>
        <Text>0</Text>
        <Text>{wantToTry}</Text>
      </View>

      <Text style={styles.question}>
        How many new recipes would you like to try in a week?
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={wantToTry}
        onChangeText={setWantToTry}
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
  recipeBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginBottom: 10,
    overflow: 'hidden',
  },
  recipeFill: {
    flex: 0.3,
    backgroundColor: '#A9BCD0',
  },
  recipeLabels: {
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
