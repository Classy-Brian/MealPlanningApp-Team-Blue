import React , { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import generatePantrySuggestions from './generatePantrySuggestions'

const PantryContext = createContext()

export const PantryProvider = ({ children }) => {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)

    const loadSuggestions = async () => {
        setLoading(true)

        try {
            const ingrRaw = await AsyncStorage.getItem('userPantry')
            const ingrLabels = ingrRaw ? JSON.parse(ingrRaw) : []

            const stored = await AsyncStorage.getItem('lastPantry')
            const pantryChanged = JSON.stringify(ingrLabels) !== stored

            let results = []
            if (pantryChanged && ingrLabels.length > 0) {
                results = await generatePantrySuggestions(ingrLabels)
            } else {
                const cached = await AsyncStorage.getItem('lastRecipes')
                results = cached ? JSON.parse(cached) : []
            }

            setSuggestions(results)
        } catch (err) {
            console.error('PantryContext: Error loading suggestions', err)
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