import AsyncStorage from '@react-native-async-storage/async-storage'
import { jwtDecode } from 'jwt-decode'

const getUserIdFromToken = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken')
        if (!token) {
            console.error("AUTHENTICATION TOKEN IS MISSING");
            return;
        }

        const decoded = jwtDecode(token)
        console.log("User's retrieved id: ", decoded._id)
        return decoded._id 
    } catch (err) {
        console.error("Error decoding token:", err)
        return null
    }
}

export default getUserIdFromToken