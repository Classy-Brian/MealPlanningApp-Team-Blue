import { Image, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/components/Sheet'
import { Divider } from 'react-native-paper'
import { textcolors } from '@/components/TextColors'
import { colors } from '@/components/Colors'
import { Ionicons } from '@expo/vector-icons'
import { fonts } from '@/components/Fonts'
import { useRouter } from 'expo-router'

function SingleIngredient() {
  return(
    <View style={det.box}>
      <View style={det.boxContainer}>
        <View style={det.leftcontain}>
          <Image 
            style={det.ingredientIcon}
            source={require('../assets/images/salt.png')}/>
          <View>                  
            <Text style={styles.regText16}>
            Ingredient </Text>
            <Text style={styles.regText16}>
              Ingredient details </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Image source={require('../assets/images/chevron_right.png')}/>
        </TouchableOpacity>
      </View>                         
    </View>
  )
}

function Category() {
  return(
    <View> 
      <Text style={det.heading}>Category</Text>
        <SingleIngredient />

      <Divider />
    </View>
  )
}

function Filter() {
  return(
    <View>
      <TouchableOpacity style={det.button}>
        <Text style={styles.regularText}>Category</Text>
      </TouchableOpacity>
    </View>
  )
}

function AddButton() {
  return(
    <View style={styles.addButton}>
        <Ionicons name="add" size={60} color='#d9d9d9' />
    </View>
  )
}

function CancelAddButton() {
  return (
    <View style={styles.cancelAddButton}>
      <Ionicons name="add" size={60} color='#10386D' style={{transform: [{rotateZ: '45deg'}]}}/>
    </View>    
  )
}

function AddFromGList() {
  return(
    <View style={det.addContainer}>
      <View style={[det.button, {marginRight: 10}]}>
        <Text style={[styles.regText16, {fontFamily: fonts.medium}]}>Add From Grocery List</Text>
      </View>
      <View style={det.addButton}>
          <Ionicons name="add" size={15} color='#d9d9d9' />
      </View>
    </View>
  )  
}

function GoPantrySuggest() {
  return(
    <View style={det.addContainer}>
      <View style={[det.button, {marginRight: 10}]}>
        <Text style={[styles.regText16, {fontFamily: fonts.medium}]}>Suggest Recipes</Text>
      </View>
      <View style={det.addButton}>
          <Ionicons name="add" size={15} color='#d9d9d9' />
      </View>
    </View>
  )
}


const Pantry = () => {
  const [pantry, setPantry] = useState('');
  const [isFocused, setFocused] = useState(styles.searchInput);

  const [addPress, setAddPress] = useState(false);

  const toggleAdd = () => {
    setAddPress((prev) => !prev)
  }
  const route = useRouter();

  return (
    <View style={styles.whiteBackground}>
      <ScrollView>
        <View style={styles.screenContainer}>
          <Text style={styles.title}>Pantry</Text>

          {/* Search Box */}
          <View style={styles.container}>          
            <TextInput
              placeholder='Search for ingredients'
              placeholderTextColor={textcolors.darkgrey}
              onChangeText={setPantry}
              value={pantry}
              style={[isFocused, styles.regularText]}
              onFocus={() => setFocused([styles.searchInput, {borderColor: colors.header}])}
              onBlur={() => setFocused([styles.searchInput])}
            />
          </View>

          {/* Filters */}
          <View style={{flexDirection: 'row'}}>

          </View>

          <Divider />

          <View style={det.listBox}>

            {/* Category */}
            <Category />
            <Category />
            <Category />
            <Category />
            <Category />
            <Category />

          </View>
        </View>
        <View style={det.space} />
      </ScrollView>
      
      <TouchableOpacity onPress={toggleAdd}>
        {addPress ? <CancelAddButton /> : <AddButton />}
      </TouchableOpacity>

      <TouchableOpacity>
        <AddFromGList />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => route.push('/(pantry)/pantrysuggest')}>
        <GoPantrySuggest />
      </TouchableOpacity>
      
      
      
      
    </View>
    
  )
}

export default Pantry

const det = StyleSheet.create({
  listBox: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  box: {
      backgroundColor: colors.lightgrey,
      borderRadius: 10,
      borderColor: textcolors.lightgrey,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 10,
    },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
    marginVertical: 5, 
  },
  ingredientIcon: {
    borderRadius: 200,
    resizeMode: 'resize',
    height: 50,
    width: 50,
    marginHorizontal: 5,
  },
  leftcontain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  space: {
    marginTop: 100,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 15,
    borderColor: textcolors.blue,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#10386D',
    borderRadius: 150,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
})