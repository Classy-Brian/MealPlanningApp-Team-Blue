import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/images/profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.username}>some_guy</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Goals For the Week</Text>

        {/* Calorie Intake */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calorie Intake</Text>
          <View style={styles.calorieBar}>
            <View style={styles.calorieLow} />
            <View style={styles.calorieMid} />
            <View style={styles.calorieHigh} />
          </View>
          <View style={styles.calorieLabels}>
            <Text>12000</Text>
            <Text>13700</Text>
            <Text>15000</Text>
          </View>
        </View>

        {/* New Recipes Tried */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Recipes Tried</Text>
          <View style={styles.recipeProgress}>
            <View style={styles.recipeFill} />
          </View>
          <View style={styles.recipeLabels}>
            <Text>2</Text>
            <Text>5</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // full white background
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
    overflow: 'hidden',
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
    marginTop: 5,
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
    width: '40%',
    backgroundColor: '#A9BCD0',
    height: '100%',
  },
  recipeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
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
