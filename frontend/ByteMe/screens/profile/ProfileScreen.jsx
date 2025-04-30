// ProfileScreen.jsx (fully updated with scrollable tab + fixed back button layout)
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '@/components/Sheet';
import { colors } from '../../components/Colors';
const backArrowImage = require('../../assets/images/back_arrow_navigate.png');

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return Alert.alert('Error', 'Not logged in.');

      await fetch(`http://localhost:5000/api/users/profile/updated/sync`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await fetch(`http://localhost:5000/api/users/profile/${token}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not load profile.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [route.params?.refresh])
  );

  const removeGoal = async (goalType) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      let updatedProfile = { ...userData.profile };
      if (goalType === 'calories') {
        updatedProfile.calories = { min: 0, max: 0, current: 0 };
      } else if (goalType === 'recipes') {
        updatedProfile.recipes = { tried: 0, wantToTry: 0 };
      }

      const response = await fetch(
        `http://localhost:5000/api/users/${userData._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ profile: updatedProfile })
        }
      );

      if (!response.ok) throw new Error('Failed to update profile');
      fetchUser();
    } catch (error) {
      console.error('Error removing goal:', error);
      Alert.alert('Error', 'Could not remove goal.');
    }
  };

  if (!userData) {
    return (
      <View style={det.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const avatarSource = userData.avatar
    ? { uri: userData.avatar }
    : require('../../assets/images/profile.png');

  const renderCalorieGoalCard = () => {
    const { min, max, current } = userData.profile.calories;
    if (min === 0 && max === 0) return null;
    const totalRange = max - min;
    const progress = totalRange > 0 ? ((current - min) / totalRange) * 100 : 0;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <View style={det.card}>
        <Text style={det.cardTitle}>Calorie Intake</Text>
        <View style={det.calorieBar}>
          <View style={[det.calorieFill, { width: `${clampedProgress}%` }]} />
        </View>
        <View style={det.calorieLabels}>
          <Text>{min}</Text>
          <Text>{max}</Text>
        </View>
        <Text style={[det.currentText, { color: progress > 100 ? 'orange' : 'black' }]}>  
          {Math.round(progress)}% of goal ({Math.round(current)} kcal)
        </Text>
        <TouchableOpacity
          style={det.removeButton}
          onPress={() => removeGoal('calories')}
        >
          <Text style={det.removeButtonText}>Remove Goal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecipesGoalCard = () => {
    const { tried, wantToTry } = userData.profile.recipes;
    if (wantToTry === 0) return null;
    const progress = (tried / wantToTry) * 100;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <View style={det.card}>
        <Text style={det.cardTitle}>New Recipes Tried</Text>
        <View style={det.recipeProgress}>
          <View style={[det.recipeFill, { width: `${clampedProgress}%` }]} />
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={[det.currentText, { color: progress > 100 ? 'orange' : 'black' }]}>  
            {Math.round(progress)}% of goal ({tried} recipes)
          </Text>
        </View>
        <View style={det.recipeLabels}>
          <Text>{tried}</Text>
          <Text>{wantToTry}</Text>
        </View>
        <TouchableOpacity
          style={det.removeButton}
          onPress={() => removeGoal('recipes')}
        >
          <Text style={det.removeButtonText}>Remove Goal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={det.container}>
      <View style={det.header}>
        <TouchableOpacity
          style={det.homeButton}
          onPress={() => navigation.goBack()}
        >
          <Image style={{ marginRight: 10 }} source={backArrowImage} />
          <Text style={det.homeText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={det.settingsButton}
          onPress={() => router.push('settings')}
        >
          <Ionicons name="settings-sharp" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={det.scrollContent}>
        <Image source={avatarSource} style={det.profileImage} />
        <Text style={det.username}>{userData.name}</Text>

        <TouchableOpacity
          style={det.editButton}
          onPress={() => navigation.navigate('edit_profile', { userId: userData._id })}
        >
          <Text style={det.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={det.sectionTitle}>Goals For the Week</Text>
        {userData.profile && (
          <>
            {renderCalorieGoalCard()}
            {renderRecipesGoalCard()}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('add_goals', { userId: userData._id })}
      >
        <Ionicons name="add" size={60} color="#d9d9d9" />
      </TouchableOpacity>
    </View>
  );
}

const det = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  homeText: {
    fontSize: 18,
    color: '#000',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.othergrey,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: colors.black,
  },
  settingsButton: {
    padding: 8,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 20,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#A9BCD0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#EEF2F7',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  calorieBar: {
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A9BCD0',
  },
  calorieFill: {
    height: '100%',
    backgroundColor: '#A9BCD0',
  },
  calorieLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  currentText: {
    textAlign: 'center',
    marginTop: 10,
  },
  recipeProgress: {
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A9BCD0',
  },
  recipeFill: {
    height: '100%',
    backgroundColor: '#A9BCD0',
  },
  recipeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: '#B93E3E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});