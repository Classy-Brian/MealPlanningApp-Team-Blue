import OpenAI from 'openai';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const JWT_SECRET = process.env.JWT_SECRET;

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
