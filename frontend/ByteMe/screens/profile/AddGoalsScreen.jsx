import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddGoalsScreen() {
  // Pull userId from the query string
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Goals</Text>

      {/* Calorie Intake Goal */}
      <TouchableOpacity
        style={styles.goalOption}
        onPress={() => router.push(`caloriegoal?userId=${userId}`)}>
        <Text style={styles.goalText}>Calorie Intake</Text>
        <Text style={styles.checkMark}>✓</Text>
      </TouchableOpacity>

      {/* New Recipes Tried Goal */}
      <TouchableOpacity
        style={styles.goalOption}
        onPress={() => router.push(`newrecipesgoal?userId=${userId}`)}
      >
        <Text style={styles.goalText}>New Recipes Tried</Text>
        <Text style={styles.checkMark}>✓</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  goalOption: {
    backgroundColor: '#EEF2F7',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 18,
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 24,
    color: '#A9BCD0',
  },
});
