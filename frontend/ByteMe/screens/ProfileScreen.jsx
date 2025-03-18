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
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  // Fetch the authenticated user from backend using the token
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Not logged in.');
        return;
      }
      const response = await fetch(
        `http://192.168.1.65:5005/api/users/profile/${token}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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
    }, [])
  );

  // Remove a specific goal (calories or recipes)
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
        `http://192.168.1.65:5005/api/users/${userData._id}`,
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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Decide what image to display: user avatar or local placeholder
  const avatarSource = userData.avatar
    ? { uri: userData.avatar }
    : require('../assets/images/profile.png');

  // Render the calorie intake goal card
  const renderCalorieGoalCard = () => {
    const { min, max, current } = userData.profile.calories;
    // If both min and max are 0, assume no calorie goal
    if (min === 0 && max === 0) return null;

    const totalRange = max - min;
    const progress = totalRange > 0 ? ((current - min) / totalRange) * 100 : 0;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorie Intake</Text>
        <View style={styles.calorieBar}>
          <View style={[styles.calorieFill, { width: `${clampedProgress}%` }]} />
        </View>
        <View style={styles.calorieLabels}>
          <Text>{min}</Text>
          <Text>{max}</Text>
        </View>
        <Text style={styles.currentText}>Current: {current}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeGoal('calories')}
        >
          <Text style={styles.removeButtonText}>Remove Goal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render the new recipes tried goal card
  const renderRecipesGoalCard = () => {
    const { tried, wantToTry } = userData.profile.recipes;
    if (wantToTry === 0) return null;

    // Calculate a rough percentage for tried in relation to wantToTry
    const progress = (tried / wantToTry) * 100;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Recipes Tried</Text>
        <View style={styles.recipeProgress}>
          <View style={[styles.recipeFill, { width: `${clampedProgress}%` }]} />
        </View>
        <View style={styles.recipeLabels}>
          <Text>{tried}</Text>
          <Text>{wantToTry}</Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeGoal('recipes')}
        >
          <Text style={styles.removeButtonText}>Remove Goal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Settings Button in the top-right */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('settings')}
      >
        <Ionicons name="settings-sharp" size={30} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <Image source={avatarSource} style={styles.profileImage} />

        {/* User Name */}
        <Text style={styles.username}>{userData.name}</Text>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`editprofile?userId=${userData._id}`)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Goals For the Week</Text>
        {userData.profile && (
          <>
            {renderCalorieGoalCard()}
            {renderRecipesGoalCard()}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button -> navigates to AddGoals screen */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push(`addgoals?userId=${userData._id}`)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Settings button positioned in the top-right
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1, // ensure it appears above other elements
    padding: 10,
  },
  settingsButtonText: {
    fontSize: 24
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 80, // add padding so content doesn't hide behind settings button
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    borderColor: '#A9BCD0'
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
    backgroundColor: '#A9BCD0'
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#133E7C',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  }
});
