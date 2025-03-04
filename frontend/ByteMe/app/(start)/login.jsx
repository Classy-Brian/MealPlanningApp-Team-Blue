import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../../components/Colors'
import { fonts } from '@/components/Fonts'

function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.stretch}
        source={require('../../assets/images/logo.png')}/>
    </View>
  )
}

const Login = () => {
  return (
    <View>
      <Text style={{styles.title}}>Sign in</Text>
      <HeaderLogo/>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'left',
        backgroundColor: colors.header,
        marginHorizontal: 65,
        paddingVertical: 55,
        paddingHorizontal: 20,
        borderRadius: 30,

    },
    stretch: {
        width: 240,
        height: 100,
        resizeMode: 'stretch'
    },
    title: {
        fontSize: 48,
        fontFamily: fonts.bold,
    }
})