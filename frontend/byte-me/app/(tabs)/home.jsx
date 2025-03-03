import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import React from 'react';
import {Link} from 'expo-router';


import favicon from "@/assets/images/favicon.png";

const APP = () => {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground 
      source={favicon}
      resizeMode='cover'
      style={styles.image}>

      <Text>Welcome to the App!</Text>
      </ImageBackground>
    </View>
  );
};

export default APP

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  image :{
    width: '100%',
    height: '100%',
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  home:{
    color: '#0065EA',
    fontSize: 16,
    fontFamily: 'Afacad',
    fontWeight: '700',
    wordWrap: 'break-word',
    textAlign: 'center',
  },

  calendar: {
    color: '#505050',
    fontSize: 15,
    fontFamily: 'Afacad',
    fontWeight: '500',
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  recipe: {
    color: '#505050',
    fontSize: 16,
    fontFamily: 'Afacad',
    fontWeight: '500',
    wordWrap: 'break-word',
  },

  grocery: {
    color: '#505050',
    fontSize: 16,
    fontFamily: 'Afacad',
    fontWeight: '500',
    wordWrap: 'break-word',
  },

  pantry: {
    color: '#505050',
    fontSize: 16,
    fontFamily: 'Afacad',
    fontWeight: '500',
    wordWrap: 'break-word',
  },

  text: {
    color: 'white',
    fontSize:42,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  }
})