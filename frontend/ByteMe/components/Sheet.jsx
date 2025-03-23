import { StyleSheet } from "react-native";
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';

export const styles = StyleSheet.create({
  whiteBackground: {
    flex: 1,
    backgroundColor: colors.white,
  },
  screenContainer: {
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginVertical: 10,
  },
    namecontainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 25,
    },
    title: {
        fontSize: 48,
        fontFamily: fonts.bold,
        marginBottom: 10,
    },
    heading: {
        fontSize: 24,
        fontFamily: fonts.semiBold,
    },
    regularText: {
        fontSize: 20,
        fontFamily: fonts.regular
    },
    regText16: {
      fontSize: 16, 
      fontFamily: fonts.regular,
    },
    forgot: {
      fontSize: 20,
      color: textcolors.red,
      fontFamily: fonts.semiBold,
    },
    createacc: {
      color: textcolors.link,
      fontSize: 20,
      fontFamily: fonts.semiBold,
    },
    buttonContainer: {
      flexDirection: 'row',
      borderRadius: 20,
      marginHorizontal: 60,
      paddingVertical: 10,
      backgroundColor: '#5a7ead',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      elevation: 2,
      shadowColor: colors.black,
    },
    buttonText: {
      fontFamily: fonts.bold,
      fontSize: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 14,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: textcolors.lightgrey,
      backgroundColor: colors.white,
    },
    focusedinput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 14,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.header,
      backgroundColor: colors.white,
    },
    container: {
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
    },
    secondcontainer: {
      justifyContent: 'left',
      marginBottom: 10,
    },
    littlenote: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 50,
      position: 'absolute',
      right: 0,
    },
    bluebottombar: {
      backgroundColor: colors.header,
      height: 100,
      top: 150,
    },
    searchInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: textcolors.darkgrey,
      backgroundColor: colors.grey,
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#10386D',
      borderRadius: 150,
      padding: 5,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
  })