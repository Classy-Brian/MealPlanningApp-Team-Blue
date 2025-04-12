import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Modal } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/components/Sheet'
import { useRouter } from 'expo-router'
import { colors } from '@/components/Colors'
import { textcolors } from '@/components/TextColors'
import { Divider } from 'react-native-paper'
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation } from '@react-navigation/native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios'

function RecipeCard() {
  return(
    <View style={det.recipeSuggestionBox}/>
  )
}

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[det.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Pantry</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const PantrySuggestions = ( { route } ) => {
  const { ingrLabels } = route.params
  const [loading, setLoading] = useState(false) 
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filters, setFilters] = useState({
      category: 'All',
      ingredient: '',
      maxCalories: '',
      cuisine: 'All',
      diet: '',
      health: '',
      caution: '',
    })

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? 'All' : value }));
  };

  const resetFilters = () => {
    setFilters({ category: 'All', cuisine: 'All', ingredient: '', maxCalories: '', diet: '', health: '', caution: '' });
  };

  
  

  return (
    <View style={styles.whiteBackground}>
        <View style={styles.screenContainer}>
          <BackButton />
          
          <Text style={styles.title}>Pantry Suggestions</Text>
          <View style={{marginBottom: 10}}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <MaterialIcons name="filter-list" size={24} color={textcolors.darkgrey} style={{ marginRight: 8 }} />
              <Text style={styles.regularText}>Filter</Text>
            </TouchableOpacity>
          </View>
          

          <Divider />
          <View style={det.recipeList}>
            <RecipeCard />
            <RecipeCard />
          </View>
          


        
        </View>
        
    </View>
  )
}

export default PantrySuggestions

const det = StyleSheet.create({
  greybutton: {
      flexDirection: 'row',
      borderRadius: 15,
      paddingHorizontal: 15,
      paddingVertical: 5,
      backgroundColor: colors.othergrey,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      elevation: 2,
      shadowColor: colors.black,
  },
  recipeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  recipeSuggestionBox: {
    backgroundColor: colors.grey,
    borderRadius: 10,
    height: 175,
    width: 175,
    borderColor: textcolors.darkgrey,
    borderWidth: 1,
    marginTop: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 12,
    alignItems: 'center',
  },
})