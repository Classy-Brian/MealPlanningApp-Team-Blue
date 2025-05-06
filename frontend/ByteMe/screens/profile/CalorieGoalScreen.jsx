import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from '@/components/Sheet';
import { SafeAreaView } from 'react-native-safe-area-context';


function BackButton(userId) {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack({userId: userId})}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Add Goals</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default function CalorieGoalScreen() {

  const route = useRoute();
  const { userId } = route.params;
  // const router = useRouter();
  const navigation = useNavigation();

  const [minCalories, setMinCalories] = useState('12000');
  const [maxCalories, setMaxCalories] = useState('15000');

  const handleAddGoal = async () => {
    try {
      const parsedMin = parseInt(minCalories, 10) || 0;
      const parsedMax = parseInt(maxCalories, 10) || 0;

      await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/${userId}`, {
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
      navigation.navigate('add_goals', {userId: userId}); // Go back to profile or addgoals screen
    } catch (error) {
      console.error('Error setting calorie goal:', error);
      Alert.alert('Error', 'Could not set calorie goal.');
    }
  };

  return (
    <SafeAreaView style={det.container}>
      <BackButton userId={userId}/>
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

      <TouchableOpacity style={det.addButton} onPress={handleAddGoal}>
        <Text style={det.addButtonText}>Add Goal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const det = StyleSheet.create({
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