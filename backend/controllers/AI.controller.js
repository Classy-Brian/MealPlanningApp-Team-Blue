  import OpenAI from 'openai';
  import axios from 'axios';
  import jwt from 'jsonwebtoken';
  import dotenv from 'dotenv';
  import User from '../models/user.model.js';

  dotenv.config();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // OpenAI Chatbot Controller
  export const chatWithAI = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const userMessage = req.body.message || '';

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', 
            content: "You are a friendly, intelligent AI assistant that helps users with meal planning, recipe suggestions, food information, and health tips. Always answer clearly, naturally, and helpfully, like a caring expert. If you don't know something exactly, make a helpful suggestion without guessing wrong information. Maintain a conversational and encouraging tone. Be concise but detailed when needed. Adapt to the user's style: casual if casual, formal if formal." },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || 'No reply generated.';
      return res.status(200).json({ reply });

    } catch (error) {
      console.error('Chatbot chat error:', error);
      return res.status(500).json({ error: 'Failed to chat.' });
    }
  };



  export const getMealPlanFromEdamam = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });

      const allergies = user.allergies || [];
      const dislikes = user.dislikes || [];
      const cuisines = user.cuisines || [];

      let calorieMin = user.profile?.calories?.min || 1500;
      let calorieMax = user.profile?.calories?.max || 2200;
      calorieMin = Math.max(1000, Math.min(calorieMin, 3000));
      calorieMax = Math.max(1200, Math.min(calorieMax, 4000));
      if (calorieMin > calorieMax) [calorieMin, calorieMax] = [calorieMax, calorieMin];

      const mealPlanId = process.env.EDAMAM_MEAL_PLAN_ID;
      const mealPlanKey = process.env.EDAMAM_MEAL_PLAN_KEY;
      const accountUser = process.env.EDAMAM_ACCOUNT_USER;
      const authBase64 = Buffer.from(`${mealPlanId}:${mealPlanKey}`).toString('base64');

      const acceptFilters = [];

      if (allergies.length > 0) {
        acceptFilters.push({ health: allergies.map(a => a.replace(/-/g, '_').toUpperCase()) });
      }

      if (cuisines.length > 0) {
        acceptFilters.push({ cuisine: cuisines.map(c => c.toLowerCase()) });
      }

      const requestBody = {
        size: 30,
        plan: {
          accept: { all: acceptFilters },
          fit: {
            ENERC_KCAL: { min: calorieMin, max: calorieMax },
            "SUGAR.added": { max: 20 }
          },
          sections: {
            Breakfast: {},
            Lunch: {},
            Dinner: {}
          }
        }
      };

      if (dislikes.length > 0) {
        requestBody.plan.exclude = dislikes.map(d => d.toLowerCase());
      }

      console.log('🛠 FINAL Request to Edamam:', JSON.stringify(requestBody, null, 2));

      const edamamResponse = await axios.post(
        `https://api.edamam.com/api/meal-planner/v1/${mealPlanId}/select?type=public`,
        requestBody,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authBase64}`,
            'Edamam-Account-User': accountUser,
          }
        }
      );

      const fullMealPlan = edamamResponse.data.selection || [];
      if (fullMealPlan.length === 0) throw new Error('No meal plan generated.');

      // Helper to fetch calories from recipe URI
      const fetchCaloriesFromUri = async (uri) => {
        if (!uri) return 0;
        const id = uri.split('#recipe_')[1];
        const apiId = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
        const apiKey = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
        const response = await axios.get(`https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${apiId}&app_key=${apiKey}`);
        return response.data.recipe.calories || 0;
      };

      // Setup flexible calorie filtering
      const targetCalories = (calorieMin + calorieMax) / 2;
      const lowerBound = targetCalories * 0.8;
      const upperBound = targetCalories * 1.2;

      const filteredDays = [];
      for (const dayObj of fullMealPlan) {
        try {
          const breakfastUri = dayObj.sections?.Breakfast?.assigned;
          const lunchUri = dayObj.sections?.Lunch?.assigned;
          const dinnerUri = dayObj.sections?.Dinner?.assigned;

          const [breakfastCals, lunchCals, dinnerCals] = await Promise.all([
            fetchCaloriesFromUri(breakfastUri),
            fetchCaloriesFromUri(lunchUri),
            fetchCaloriesFromUri(dinnerUri),
          ]);

          const totalCalories = breakfastCals + lunchCals + dinnerCals;

          if (totalCalories >= lowerBound && totalCalories <= upperBound) {
            filteredDays.push(dayObj);
          }

          if (filteredDays.length === 7) break;
        } catch (err) {
          console.error('Error fetching calories for a day:', err.message);
        }
      }

      // Fill randomly if needed
      if (filteredDays.length < 7) {
        const missing = 7 - filteredDays.length;
        const additionalDays = fullMealPlan
          .filter(day => !filteredDays.includes(day))
          .sort(() => 0.5 - Math.random())
          .slice(0, missing);
        filteredDays.push(...additionalDays);
      }

      return res.status(200).json({ mealPlan: filteredDays });

    } catch (error) {
      console.error('Meal Plan Error:', {
        message: error.message,
        responseData: error.response?.data,
        responseStatus: error.response?.status,
        requestData: JSON.stringify(error.config?.data)
      });
      return res.status(500).json({ error: 'Failed to generate meal plan.' });
    }
  };

