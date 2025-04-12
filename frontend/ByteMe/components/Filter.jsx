import { StyleSheet } from "react-native";
import { colors } from '@/components/Colors';
import { textcolors } from '@/components/TextColors';
import { fonts } from '@/components/Fonts';

export const filterModal = StyleSheet.create({
    modalBackground: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#00000088',
    },
    modalContainer: {
        backgroundColor: 'white', 
        borderRadius: 10, 
        padding: 20, 
        width: '90%'
    },
    modalTitle: {
        fontSize: 28, 
        fontFamily: fonts.bold, 
    },
    modalLabel: {
        fontSize: 20,
        fontFamily: fonts.medium, 
        marginTop: 10
    },
    modalInput: {
        borderWidth: 1,
        borderColor: textcolors.lightgrey,
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
        fontFamily: fonts.regular,
        fontSize: 16
    },
    modalActions: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 20
    },    
    cancelButton: {
        padding: 10, 
        borderRadius: 8, 
        backgroundColor: '#eee', 
        flex: 1, 
        marginRight: 10, 
        alignItems: 'center'
    },
    applyButton: {
        padding: 10, 
        borderRadius: 8, 
        backgroundColor: colors.primary, 
        flex: 1, 
        alignItems: 'center'
    },
    filterOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: textcolors.lightgrey,
        marginRight: 8,
    },
    filterOptionSelected: {
        backgroundColor: colors.primary, 
        borderColor: colors.primary
    },
    filterOptionTextSelected: {
        fontFamily: fonts.regular,
        fontSize: 16
    },    
    filterOptionText: {
        fontFamily: fonts.regular,
        fontSize: 16
    },
    filterRow: {
        flexDirection: 'row', 
        marginTop: 5, 
        marginBottom: 10
    }
})