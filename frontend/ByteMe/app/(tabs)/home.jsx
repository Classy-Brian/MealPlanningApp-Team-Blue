import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { Divider } from 'react-native-paper'
import { styles } from '@/components/Sheet'
import { colors } from '@/components/Colors'
import { textcolors } from '@/components/TextColors'

function SuggestRecipe() {
  return(
    <View style={det.recipeSuggestionBox} />
  )
}

const Homepage = () => {
  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Homepage</Text>

        {/* Recipe Suggestions */}
        <Divider />
        <View>
          <Text style={[styles.heading, {marginVertical: 10}]}>Recipes you may like</Text>


          <ScrollView style={det.carousel} horizontal={true}>
            <SuggestRecipe />
            <SuggestRecipe />
          </ScrollView>
          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity style={det.button}>
              <Text style={styles.regularText}>Discover More</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider />
        

      </View>
    </View>
   
  )
}



export default Homepage


const det = StyleSheet.create({
  carousel: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  recipeSuggestionBox: {
    backgroundColor: colors.grey,
    borderRadius: 10,
    height: 150,
    width: 250,
    borderColor: textcolors.darkgrey,
    borderWidth: 1,
    marginRight: 30,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 15,
    borderColor: textcolors.blue,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 12, 
  }
})