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
        fontSize: 16,
        fontFamily: fonts.regular
    },
    forgot: {
      fontSize: 16,
      color: textcolors.red,
      fontWeight: 'bold',
    },
    createacc: {
      color: textcolors.link,
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      borderRadius: 20,
      marginHorizontal: 60,
      paddingVertical: 10,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      elevation: 2,
      shadowColor: colors.black,
    },
    buttonText: {
      fontFamily: fonts.bold,
      fontSize: 16,
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
    }
  })