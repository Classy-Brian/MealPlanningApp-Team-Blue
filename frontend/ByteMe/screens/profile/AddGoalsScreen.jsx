import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,  
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from '@/components/Sheet';


function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Profile</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default function AddGoalsScreen() {
  // Pull userId from the query string
  const route = useRoute();
  const { userId } = route.params;
  // const router = useRouter();
  const navigation = useNavigation();
  

  return (
    <View style={det.container}>
      <BackButton />
      <Text style={styles.title}>Add Goals</Text>

      {/* Calorie Intake Goal */}
      <TouchableOpacity
        style={det.goalOption}
        onPress={() => navigation.navigate('calorie_goal', {userId: userId})}
        // onPress={() => router.push(`caloriegoal?userId=${userId}`)}
        >
        <Text style={det.goalText}>Calorie Intake</Text>
        <Text style={det.checkMark}>✓</Text>
      </TouchableOpacity>

      {/* New Recipes Tried Goal */}
      <TouchableOpacity
        style={det.goalOption}
        onPress={() => navigation.navigate('new_recipe_goal', {userId: userId})}
        // onPress={() => router.push(`newrecipesgoal?userId=${userId}`)}
      >
        <Text style={det.goalText}>New Recipes Tried</Text>
        <Text style={det.checkMark}>✓</Text>
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