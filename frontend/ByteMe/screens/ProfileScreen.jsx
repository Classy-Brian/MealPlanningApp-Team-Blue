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
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const router = useRouter();

  // Hard-coded userId will need to replace with real ID or retrieve from auth context
  const userId = '67d775c23cae84324cbe0bd0';

  // State for storing fetched user data
  const [userData, setUserData] = useState(null);

  // Fetch the user from backend
  const fetchUser = async () => {
    try {
      const response = await fetch(`http://192.168.1.65:5005/api/users/${userId}`);
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser(); // Refetch user data when returning to the screen
    }, [])
  );

  // Decide what image to display: user avatar or local placeholder
  const avatarSource = userData?.avatar
    ? { uri: userData.avatar }
    : require('../assets/images/profile.png');

  // Helper to remove a specific goal (e.g., calorie or recipe)
  const removeGoal = async (goalType) => {
    try {
      let updatedProfile = { ...userData.profile };

      if (goalType === 'calories') {
        // Reset the calorie goals to 0
        updatedProfile.calories = { min: 0, max: 0, current: 0 };
      } else if (goalType === 'recipes') {
        // Reset the recipe "wantToTry" (or both tried/wantToTry) to 0
        updatedProfile.recipes = { tried: 0, wantToTry: 0 };
      }

      // Send PATCH request to update user profile
      await fetch(`http://192.168.1.65:5005/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile })
      });

      // Refresh user data
      fetchUser();
    } catch (error) {
      console.error('Error removing goal:', error);
      Alert.alert('Error', 'Could not remove goal.');
    }
  };

  // Render the calorie intake goal card if min/max are set
  const renderCalorieGoalCard = () => {
    const { min, max, current } = userData.profile.calories;
    // If both min and max are 0, we assume no calorie goal
    if (min === 0 && max === 0) return null;

    // Calculate a rough percentage for current in relation to max
    const totalRange = max - min;
    const progress = totalRange > 0 ? ((current - min) / totalRange) * 100 : 0;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorie Intake</Text>
        <View style={styles.calorieBar}>
          <View
            style={[
              styles.calorieFill,
              { width: `${clampedProgress}%` }
            ]}
          />
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

  // Render the new recipes tried goal card if wantToTry > 0
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
          <View
            style={[
              styles.recipeFill,
              { width: `${clampedProgress}%` }
            ]}
          />
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <Image
          source={avatarSource}
          style={styles.profileImage}
        />

        {/* User Name */}
        <Text style={styles.username}>
          {userData ? userData.name : 'Loading...'}
        </Text>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`editprofile?userId=${userId}`)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Goals For the Week</Text>
        {userData && userData.profile && (
          <>
            {renderCalorieGoalCard()}
            {renderRecipesGoalCard()}
          </>
        )}
      </ScrollView>

      {/* Floating Add Button -> navigates to AddGoals screen */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push(`addgoals?userId=${userId}`)}
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
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
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
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginBottom: 5,
    overflow: 'hidden',
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
    backgroundColor: '#A9BCD0',
    height: '100%',
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
  },
});
