import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '@/components/Sheet'

const Grocery = () => {
  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Grocery</Text>
      </View>
    </View>
    
  )
}

export default Grocery