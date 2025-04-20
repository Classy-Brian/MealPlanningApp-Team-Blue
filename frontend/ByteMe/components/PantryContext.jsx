import React , { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import generatePantrySuggestions from './generatePantrySuggestions'
import getUserIdFromToken from './getUserIdFromToken'
import axios from 'axios'

const PantryContext = createContext()

export const PantryProvider = ({ children }) => {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)

    const loadSuggestions = async () => {
        setLoading(true)
        let results = []
        try {
            const userId = await getUserIdFromToken();
            if (!userId) {
                console.warn("User ID not found");
                setLoading(false);
                return;
            }
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/get-saved-pantry`
              );
              
            if (response.data && response.data.savedPantry) {
                const savedPantry = response.data.savedPantry
                const ingrLabels = savedPantry.map(item => item.label)
                console.log("Retrieved the ingrlabels:", ingrLabels)

                const storedPantryRaw = await AsyncStorage.getItem('lastPantry')
                const storedPantry = storedPantryRaw ? JSON.parse(storedPantryRaw) : []

                const pantryChanged = JSON.stringify(ingrLabels) !== JSON.stringify(storedPantry)

                const cachedRecipesRaw = await AsyncStorage.getItem('lastRecipes')
                const cachedRecipes = cachedRecipesRaw ? JSON.parse(cachedRecipesRaw) : []

                
                if (pantryChanged || cachedRecipes.length === 0) {
                    console.log('Generating new suggestions')
                    results = await generatePantrySuggestions(ingrLabels)
                } else {
                    console.log('Using cached pantry recipe suggestions . . .')
                    // const cached = await AsyncStorage.getItem('lastRecipes')
                    results = cachedRecipes
                }
                setSuggestions(results)
                await AsyncStorage.setItem('lastPantry', JSON.stringify(ingrLabels))
                await AsyncStorage.setItem('lastRecipes', JSON.stringify(results))
            } else {
                console.warn("No saved pantry data found.")
                setSuggestions([])
            }
            // const ingrRaw = await AsyncStorage.getItem('userPantry')
            // const ingrLabels = ingrRaw ? JSON.parse(ingrRaw) : []
        } catch (err) {
            console.error('PantryContext: Error loading suggestions', err)
            setSuggestions([])
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadSuggestions()
    }, [])

    return (
        <PantryContext.Provider value={{ suggestions, loading, reloadSuggestions: loadSuggestions}}>
            {children}
        </PantryContext.Provider>
    )
}

export const usePantry = () => useContext(PantryContext)