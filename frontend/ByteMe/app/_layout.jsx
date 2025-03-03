import { View, Text, Button } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'


// function HeaderLogo = () => {
//   return (
//     <View style={{flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems:
//       <Image 
//     }}>

//     </View>
//   )
// }

const _layout = () => {
  return (
    <Stack >
        <Stack.Screen name="(tabs)"
          options={{
            headerShown: true,
            title: 'ByteMe',
            headerStyle: {
              backgroundColor: '#1F508F'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            }} />
    </Stack>
  )
}

export default _layout