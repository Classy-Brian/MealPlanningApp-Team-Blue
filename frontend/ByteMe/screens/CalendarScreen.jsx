import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '@/components/Sheet'

const Calendar = () => {
  return (
    <View style={styles.whiteBackground}>
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Calendar</Text>
      </View>
    </View>
    
  )
}

export default Calendar