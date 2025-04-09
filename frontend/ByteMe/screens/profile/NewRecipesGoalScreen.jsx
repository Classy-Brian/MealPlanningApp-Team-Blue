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


function BackButton(userId) {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.navigate('add_goals', {userId: userId})}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Add Goals</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default function NewRecipesGoalScreen() {
  const route = useRoute();
  const { userId } = route.params;  
  // const router = useRouter();
  const navigation = useNavigation();

  const [wantToTry, setWantToTry] = useState('5');

  const handleAddGoal = async () => {
    try {
      const parsedWantToTry = parseInt(wantToTry, 10) || 0;

      await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/${userId}`, {
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
      navigation.navigate('add_goals', {userId: userId});
    } catch (error) {
      console.error('Error setting recipes goal:', error);
      Alert.alert('Error', 'Could not set recipes goal.');
    }
  };

  return (
    <View style={det.container}>
      <BackButton userId={userId}/>
      <Text style={styles.title}>New Recipes Tried</Text>

      {/* Progress bar */}
      <View style={det.recipeBar}>
        <View style={det.recipeFill} />
      </View>
      <View style={det.recipeLabels}>
        <Text>0</Text>
        <Text>{wantToTry}</Text>
      </View>

      <Text style={det.question}>
        How many new recipes would you like to try in a week?
      </Text>
      <TextInput
        style={det.input}
        keyboardType="numeric"
        value={wantToTry}
        onChangeText={setWantToTry}
      />

      <TouchableOpacity style={det.addButton} onPress={handleAddGoal}>
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