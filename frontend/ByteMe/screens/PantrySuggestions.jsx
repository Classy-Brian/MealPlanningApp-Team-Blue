import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import React from 'react'
import { styles } from '@/components/Sheet'
import { useRouter } from 'expo-router'
import { colors } from '@/components/Colors'
import { textcolors } from '@/components/TextColors'
import { Divider } from 'react-native-paper'

function Recipe() {
  return(
    <View style={det.recipeSuggestionBox}/>
  )
}

const PantrySuggestions = () => {
  const route = useRouter();

  return (
    <View style={styles.whiteBackground}>
      <ScrollView>
        <View style={styles.screenContainer}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => route.replace('/(tabs)/pantry')}>
            <View style={[det.greybutton, ]}>
              <Image style={{marginRight:10}}
                      source={require('../assets/images/back_arrow_navigate.png')}/>
              <Text style={styles.regularText}>Survey</Text>
            </View>
          </TouchableOpacity>
          </View>
          
          <Text style={styles.title}>Pantry Suggestions</Text>

          <Divider />
          <View style={det.recipeList}>
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
            <Recipe />
          </View>
          

        </View>
      </ScrollView>
        
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
})