import { StyleSheet } from "react-native";
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';

export const styles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
    logocontainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.header,
        marginHorizontal: 65,
        paddingVertical: 55,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    namecontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    stretch: {
        width: 240,
        height: 100,
        resizeMode: 'stretch'
    },
    title: {
        fontSize: 48,
        fontFamily: fonts.bold,
    },
    heading: {
        fontSize: 24,
        fontFamily: fonts.semiBold,
    },
    regularText: {
        fontSize: 15,
        fontFamily: fonts.regular
    },
    forgot: {
      fontSize: 15,
      color: textcolors.red,
      fontWeight: 'bold',
    },
    createacc: {
      color: textcolors.blue,
      fontSize: 15,
    },
    buttonContainer: {
      marginHorizontal: 30,
      paddingHorizontal: 20,
      borderRadius: 10,
      paddingVertical: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: textcolors.lightgrey,
      backgroundColor: colors.white,
    },
    container: {
      justifyContent: 'center',
      marginHorizontal: 20,
      paddingVertical: 10,
    },
    secondcontainer: {
      justifyContent: 'center',
      marginHorizontal: 5,
      paddingVertical: 10,
    },
    littlenote: {
      flexDirection: 'row'
    },
  })