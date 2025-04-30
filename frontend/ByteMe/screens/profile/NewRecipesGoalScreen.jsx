import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
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

export default function NewRecipesGoalScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [wantToTry, setWantToTry] = useState('5');

  useEffect(() => {
    async function fetchUserId() {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);
      } catch (err) {
        console.error('Failed to get user ID:', err);
      }
    }
    fetchUserId();
  }, []);

  const handleAddGoal = async () => {
    try {
      if (!userId) {
        console.warn('User ID not yet available.');
        return;
      }

      const parsedWantToTry = parseInt(wantToTry, 10) || 0;

      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            recipes: {
              tried: 0,
              wantToTry: parsedWantToTry,
            },
          },
        }),
      });

      Alert.alert('Success', 'New Recipes Tried Goal added!');
      navigation.navigate('add_goals', { userId });
    } catch (error) {
      console.error('Error setting recipes goal:', error);
      Alert.alert('Error', 'Could not set recipes goal.');
    }
  };

  return (
    <View style={det.container}>
      <BackButton />
      <Text style={styles.title}>New Recipes Tried</Text>

      {/* Progress bar */}
      <View style={det.recipeBar}>
        <View style={[det.recipeFill, { flex: parseInt(wantToTry || '0', 10) / 10 }]} />
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
  recipeBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginBottom: 10,
    overflow: 'hidden',
  },
  recipeFill: {
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
