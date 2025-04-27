import OpenAI from 'openai';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const JWT_SECRET = process.env.JWT_SECRET;

const EDAMAM_APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;
if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
  console.error("FATAL ERROR: Edamam App ID or App Key not found in environment variables.");
}

export const getMealPlanFromAI = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded._id;
    console.log("Decoded user ID:", userId);

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = req.body.preferences || [];
    const allergies = Array.isArray(user.allergies) ? user.allergies.join(', ') : 'none';
    const calorieTarget = user.profile?.calories?.max || 2000;

    const prompt = `
You are a friendly and knowledgeable AI nutrition assistant. Your job is to help users stay healthy and enjoy their meals by creating a personalized and well-balanced 3-day meal plan based on their preferences, dietary needs, and any allergies they may have.

Please take into account the following information:

Daily calorie limit: ${calorieTarget} kcal

Allergies to avoid: ${allergies}

User preferences: ${preferences.length > 0 ? preferences.join(', ') : 'None specified'}

📝 Instructions for how to respond:

Create meals that are realistic, tasty, and easy to prepare, using everyday ingredients.

Be mindful of allergies and avoid any ingredients that may trigger them.

Respect any dietary preferences (e.g., vegetarian, low carb, high protein).

Each day should include:

Breakfast

Lunch

Dinner

Optional healthy snacks

 Format your response like this:

Day 1

Breakfast: ...

Lunch: ...

Dinner: ...

Snacks: ...

Day 2
...

 Be conversational and helpful, like a friendly coach. Feel free to add a short comment after each day with a tip or encouraging message, like:
"This day offers great variety and keeps you energized all day!"

 Your goal is to help the user eat well, feel good, and stick to their goals with food that feels enjoyable and never restrictive.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const plan = completion.choices[0]?.message?.content || 'No plan generated.';
    return res.status(200).json({ plan });

  } catch (error) {
    console.error('AI generation error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(500).json({ error: 'Failed to generate meal plan.' });
  }
};

const constructMealPlanPrompt = (user) => {
  // Extracts user preferences and builds the detailed prompt string
  // requesting JSON output, as we designed previously.

  const allergies = Array.isArray(user.allergies) && user.allergies.length > 0 ? user.allergies.join(', ') : 'none';
  const dislikes = Array.isArray(user.dislikes) && user.dislikes.length > 0 ? user.dislikes.join(', ') : 'none';
  const cuisines = Array.isArray(user.cuisines) && user.cuisines.length > 0 ? user.cuisines.join(', ') : 'any';
  const portion = user.portion || '1';
  const minCalories = user.profile?.calories?.min || 1800;
  const maxCalories = user.profile?.calories?.max || 2500;
  let frequencyDesc = '';
  if (user.frequency === "1.5") frequencyDesc = "cooks 1-2 times a week";
  else if (user.frequency === "3.5") frequencyDesc = "cooks 3-4 times a week";
  else if (user.frequency === "6") frequencyDesc = "cooks 5-7 times a week";

  const jsonStructure = `
  [
    {
      "day": 1,
      "meals": {
        "breakfast": { "suggestion": "Suggest a brief meal description or recipe name here" },
        "lunch": { "suggestion": "Suggest a brief meal description or recipe name here" },
        "dinner": { "suggestion": "Suggest a brief meal description or recipe name here" }
      },
      "notes": "Optional: Add a brief encouraging note for the day"
    }
    // Add structure for Day 2 if needed, just make sure it's valid JSON array
  ]
  `;

  const prompt = `
You are an AI meal planning assistant. Generate a personalized 1-day meal plan based on the following user requirements.

User Profile:
- Allergies: ${allergies}
- Disliked Ingredients: ${dislikes}
- Preferred Cuisines: ${cuisines}
- Number of Servings per Meal: ${portion}
- Daily Calorie Goal: Between ${minCalories} and ${maxCalories} kcal total for the day.
- Cooking Frequency Context: User ${frequencyDesc || 'has not specified cooking frequency'}.

Instructions:
1. Create realistic, balanced, and appealing meal suggestions (breakfast, lunch, dinner) for 1 day.
2. Ensure all suggestions strictly avoid the allergies and disliked ingredients listed.
3. Try to incorporate preferred cuisines if possible.
4. Aim for the total daily calories to fall within the specified range (${minCalories}-${maxCalories} kcal). Distribute calories reasonably across meals.
5. Provide suggestions as meal descriptions or common recipe names that are likely findable in a recipe database (like Edamam). Do not invent complex, obscure recipes. Keep descriptions concise.
6. Respond ONLY with a valid JSON object containing the meal plan, following this exact structure:
\`\`\`json
${jsonStructure}
\`\`\`
Do not include any introductory text, explanations, or apologies outside of the JSON structure. Just output the JSON.
`;
  return prompt;

};

export const generateStructuredMealPlan = async (req, res) => {
  console.log("Request received at /generate-structured-plan endpoint!");

  try {

    // ============================================================
    // SECTION 1: AUTHENTICATION & USER DATA FETCHING
    // ============================================================
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log("No token provided in Authorization header.");
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log("Token found in header:", token ? "Yes" : "No");
    console.log("Attempting to verify token...");

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token verified successfully. Payload:", decoded);
    } catch (jwtError) {
      console.error("JWT Verification Error:", jwtError.name, jwtError.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded._id;
    if (!userId) {
      console.error("User ID (_id) not found in JWT payload after verification.");
      return res.status(401).json({ error: 'Invalid token payload: User ID missing.' });
    }
    console.log("Extracted User ID:", userId);

    console.log("Fetching user from database...");
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log(`User not found in database for ID: ${userId}`);
      return res.status(404).json({ error: 'User associated with this token not found' });
    }
    console.log(`User ${user.email} found. Proceeding...`);

    // ============================================================
    // SECTION 2: PREPARE & CALL OPENAI API
    // ============================================================

    console.log("Constructing prompt for AI...");
    const prompt = constructMealPlanPrompt(user);
    console.log("--- Generated Prompt ---");
    console.log(prompt);
    console.log("----------------------");

    console.log("Sending prompt to OpenAI API...");

    let aiResponseContent;
    try {
      const modelChoice = "gpt-3.5-turbo-0125";
      console.log(`Using OpenAI model: ${modelChoice}`);
      const completion = await openai.chat.completions.create({
        model: modelChoice,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7,
      });

      aiResponseContent = completion.choices[0]?.message?.content;

      console.log("Received response from OpenAI API.");
      console.log("--- Raw AI Response Content ---");
      console.log(aiResponseContent);
      console.log("------------------------------");

      if (!aiResponseContent) {
        console.error("AI response content is empty.");
        throw new Error("Received empty response content from AI.");
      }

      console.log("Parsing AI response JSON...");

    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);

      let errorMessage = "Failed to get response from AI service.";
      if (apiError instanceof OpenAI.APIError) {
        console.error("API Error Status:", apiError.status);
        console.error("API Error Details:", apiError.error);
        errorMessage = `AI service error (${apiError.status}): ${apiError.error?.message || 'Unknown error'}`;
      } else if (apiError.message) {
        errorMessage = `AI service error: ${apiError.message}`;
      }

      return res.status(500).json({ error: errorMessage });
    }

    // ============================================================
    // SECTION 3: PARSE AI RESPONSE
    // ============================================================

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(aiResponseContent);

      console.log("--- Parsed AI Plan (JavaScript Object) ---");
      console.log(parsedPlan);
      console.log("-----------------------------------------");

      if (typeof parsedPlan !== 'object' || parsedPlan === null || !parsedPlan.meals) {
        throw new Error("Parsed response is not the expected object structure.");
      }

      console.log("AI response parsed successfully.");

    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", parseError);
      console.error("Raw AI Response that failed parsing was:", aiResponseContent);
      return res.status(500).json({ error: "Failed to parse AI meal plan response. Invalid JSON format received." });
    }

    // ============================================================
    // SECTION 4: EDAMAM INTEGRATION
    // ============================================================

    let processedMeals = {};

    console.log("--- Starting Edamam Search Loop ---");

    for (const [mealType, mealData] of Object.entries(parsedPlan.meals)) {
      const aiSuggestion = mealData?.suggestion;
      console.log(`\nProcessing Meal: ${mealType.toUpperCase()}`);

      if (!aiSuggestion) {
        console.log(`No AI suggestion found for ${mealType}. Skipping Edamam search.`);
        processedMeals[mealType] = { source: 'ai', suggestion: 'No suggestion provided.' };
        continue;
      }

      // --- Build Edamam query parameters (Health, Excluded, Calories) ---
      console.log("Mapping allergies...");
      const edamamHealthLabels = {
        'Milk': 'dairy-free',
        'Egg': 'egg-free',
        'Fish': 'fish-free',
        'Shellfish': 'shellfish-free',
        'Tree Nuts': 'tree-nut-free',
        'Peanuts': 'peanut-free',
        'Wheat': 'wheat-free',
        'Soybeans': 'soy-free',
        'Sesame': 'sesame-free'
      };
      let healthParams = user.allergies.map(a => edamamHealthLabels[a]).filter(l => l).map(l => `&health=${encodeURIComponent(l)}`).join('');
      console.log("Generated Health Params:", healthParams);

      console.log("Mapping dislikes...");
      let excludedParams = user.dislikes.map(d => `&excluded=${encodeURIComponent(d.toLowerCase())}`).join('');
      console.log("Generated Excluded Params:", excludedParams);

      console.log("Calculating calorie range...");
      const dailyMinCalories = user.profile?.calories?.min || 2000;
      const dailyMaxCalories = user.profile?.calories?.max || 3000;
      const avgDailyCalories = (dailyMinCalories + dailyMaxCalories) / 2;
      const targetCaloriesPerMeal = Math.round(avgDailyCalories / 3);
      const calorieBuffer = 150;
      const calorieRange = `${Math.max(0, targetCaloriesPerMeal - calorieBuffer)}-${targetCaloriesPerMeal + calorieBuffer}`;
      const caloriesParam = `&calories=${encodeURIComponent(calorieRange)}`;
      console.log("Generated Calories Param:", caloriesParam);

      // --- Construct Edamam URL (with all filters) ---
      const query = encodeURIComponent(aiSuggestion || '');
      // const edamamApiUrl = 
      //   `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}${healthParams}${excludedParams}${caloriesParam}`;
      
      // Removed calorie param
      const edamamApiUrl =
        `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}${healthParams}${excludedParams}`;
      
      console.log(`Request URL (debug, with all filters): ${edamamApiUrl}`);

      // --- Call Edamam API (Now inside the loop) ---
      try {
        console.log(`Searching Edamam for "${mealType}": "${aiSuggestion}"`);
        const edamamResponse = await axios.get(edamamApiUrl);
        const edamamData = edamamResponse.data;
        console.log(`Edamam Response Status: ${edamamResponse.status}, Found ${edamamData.hits?.length || 0} recipes.`);

        if (edamamData.hits?.length > 0) {
          const recipe = edamamData.hits[0].recipe;

          // Extract relevant details
          const label = recipe.label;
          const uri = recipe.uri;
          const url = recipe.url;
          const imageUrl = recipe.image;
          const totalCalories = Math.round(recipe.calories);
          const servings = recipe.yield || 1;
          const caloriesPerServing = Math.round(totalCalories / servings);

          // Log the extracted details for confirmation
          console.log(`  -> Found: ${label}`);
          console.log(`     URI: ${uri}`);
          console.log(`     URL: ${url}`);
          console.log(`     Image: ${imageUrl}`);
          console.log(`     Cal/Serving: ${caloriesPerServing} (Total: ${totalCalories}, Yield: ${servings})`);

          // Store the extracted Edamam data for this meal type
          processedMeals[mealType] = {
            source: 'edamam',
            label: label,
            uri: uri,
            url: url,
            imageUrl: imageUrl,
            calories: caloriesPerServing,
            servings: servings
          };
          
        } else {
          console.log(`  -> No recipes found on Edamam for ${mealType}. Storing AI suggestion.`);
          processedMeals[mealType] = {
              source: 'ai',
              suggestion: aiSuggestion
          };
        }
      } catch (edamamError) {
        console.error(`Error fetching data from Edamam for "${mealType}":`);
        if (edamamError.response) {
          console.error('Edamam Error Status:', edamamError.response.status);
            console.error('Edamam Error Data:', edamamError.response.data);
        } else if (edamamError.request) {
          console.error('Edamam Error Request:', edamamError.request);
        } else {
          console.error('Edamam Error Message:', edamamError.message);
        }
        console.log("Continuing plan generation despite Edamam error for this meal.");
        console.log(`Storing original AI suggestion for ${mealType} due to Edamam error.`);
        processedMeals[mealType] = {
          source: 'ai_error',
          suggestion: aiSuggestion
        };
      }
    }
    console.log("--- Finished Edamam Search Loop ---");
    
    return res.status(200).json({
      message: "AI response parsed. Edamam loop structure test complete.",
      userEmail: user.email,
      generatedPlan: processedMeals
    });
  } catch (error) {
    console.error("Error in generateStructuredMealPlan:", error);
    return res.status(500).json({ error: "Failed inside new structured plan generator." });
  }
};