import axios from 'axios'
import getUserIdFromToken from '@/components/getUserIdFromToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

const generatePantrySuggestions =  async (ingrLabels) => {
  if (!Array.isArray(ingrLabels) || ingrLabels.length === 0) {
    console.warn("Ingredient labels are empty or not an array.");
    return [];
  }
    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
    try {
        const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("User ID not found");
        setLoading(false);
        return;
      }
      // console.log("sending user id: ", userId);

      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/${userId}/generate-pantry-suggestions/`,
        {ingrLabels: ingrLabels}
      );

      const ideas = res.data.choices[0].message.content.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      // console.log("returned ideas:", ideas)

      const recipePromises = ideas.map(async (idea) => {
        const encoded = encodeURIComponent(idea)
        console.log("idea being sent: ", idea)
        const response = await axios.get(
          `https://api.edamam.com/api/recipes/v2?type=public&q=${encoded}&app_id=${API_ID}&app_key=${API_KEY}`
        );
        return response.data.hits.slice(0, 3);
      });

      const results = await Promise.all(recipePromises)
      const flattenedResults = results.flat()

      // await AsyncStorage.setItem('lastRecipes', JSON.stringify(flattenedResults || []))
      // await AsyncStorage.setItem('lastPantry', JSON.stringify(ingrLabels))

      return flattenedResults
    } catch (err) {
        console.error('Error fetching recipes:', err);
        return []
    }
}

export default generatePantrySuggestions
