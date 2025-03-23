import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { styles } from '@/components/Sheet'

const Homepage = () => {
  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Homepage</Text>
      </View>
    </View>
   
  )
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   }
// })

export default Homepage
