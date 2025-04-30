import User from '../models/user.model.js'; 
import Recipe from '../models/recipe.model.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import axios from 'axios'
import crypto from 'crypto'; 
import sendEmail from '../utils/sendEmail.js';

dotenv.config();
const JWT_SECRET = `${process.env.JWT_SECRET}` 

// GENERATE a JWT token
const generateToken = (userId, time) => {
  return jwt.sign({_id: userId}, JWT_SECRET, {expiresIn: time});
}


//CREATE: Register a new User
export const createUser = asyncHandler(async (req, res) => {
  console.log("Received registration request:", req.body);

  const { name, email, password, allergies = [], portion = 1, dislikes = [], cuisines = [], profile = {}, avatar } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
  }

  // Check if user already exists by email
  const userExists = await User.findOne({ email });
  if (userExists) {
      res.status(400);
      throw new Error('User already exists with that email');
  }

  // Create new user document
  const user = await User.create({
    name,
    email,
    avatar,
    password,
    allergies,
    portion,
    dislikes,
    cuisines,
    profile,
    isVerified: false
  });

  if (!user) {
       res.status(400);
       throw new Error('Invalid user data, user creation failed');
  }

  console.log("User.create called")

  // Email Verification Logic 
  let emailSentSuccessfully = false;
  let verificationToken = '';
  try {
    verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyEmailUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/verify/${verificationToken}`;

    const message = `
      Thank you for registering for ByteMe!

      Please verify your email address by clicking the link below, or by pasting it into your browser:
      \n\n
      ${verifyEmailUrl}
      \n\n
      If you did not create this account, please ignore this email.
      This link will expire in 15 minutes.`;

    await sendEmail({
        email: user.email,
        subject: 'ByteMe Account Email Verification',
        message,
    });
    emailSentSuccessfully = true;
    console.log("Verification email initiated successfully for:", user.email);

  } catch (emailError) {
    console.error('Email sending/token saving failed:', emailError);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Failed to clear verification token after email error:", saveError); }

  }

  const loginToken = generateToken(user._id, '1h'); // Generate login token
  console.log(`loginToken: ${loginToken}`)

  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      allergies: user.allergies,
      portion: user.portion,
      dislikes: user.dislikes,
      cuisines: user.cuisines,
      profile: user.profile,
      isVerified: user.isVerified, 
      savedRecipes: user.savedRecipes
    },
      token: loginToken, // Send login token
      message: emailSentSuccessfully
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful! Could not send verification email, please try verifying later.'
  });
});

export const verifyUserEmail = asyncHandler(async (req, res) => {
  console.log("verifyUserEmail called with token:", req.params.token);

  // Get the unhashed token from the URL parameter
  const verificationToken = req.params.token;

  // Hash the token received from the URL
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  console.log("Searching for user with hashed verification token:", hashedToken);

  // Find the user by the HASHED token and check expiry
  const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }, // Token hasn't expired
  });

  // Check if user found and token is valid
  if (!user) {
    console.log("Verification token is invalid or has expired.");
    res.status(400);
    throw new Error('Verification token is invalid or has expired');
  }

  // Verification successful: Update user
  user.isVerified = true;
  user.emailVerificationToken = undefined; // Clear the token
  user.emailVerificationExpires = undefined; // Clear the expiry
  await user.save({ validateBeforeSave: false });

  console.log("User email verified successfully:", user.email);

  // Respond to the user
  // Send JSON success message
  res.status(200).json({ message: "Email verified successfully! You can now log in." });
});

//READ: Get All Users. for admin or debugging
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); 
    //.select('-password') hides the password field

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//READ: Get Single User by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate 'recipes' to get actual recipe documents if needed. otherwise returns the id.
    // .populate('recipes')
    const user = await User.findById(id)
    .select('-password')
    .populate('savedRecipes')
    ;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req, res) => {
  console.log("getUserProfile called");
  const token = req.params.token; // Get token from URL parameter
  console.log("Token from URL:", token);

  if (!token) {
      res.status(401);
      throw new Error('No token provided'); 
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      console.log("Decoded token:", decoded);
      const userId = decoded._id; // Extract user ID
      console.log("Extracted userId:", userId);

      const user = await User.findById(userId).select('-password');
      console.log("User found:", user);

      if (!user) {
          res.status(404);
          throw new Error('User not found'); 
      }

      res.json(user); // Return the user data

  } catch (error) {
      console.error("Error in getUserProfile:", error);
      res.status(401); // 401 for invalid token
      throw new Error('Invalid token');
  }
};

export const updateUserPreferences = async (req, res) => {
  console.log("updateUserPreferences called");
  console.log("req.body:", req.body);
  console.log("req.user:", req.user);

  const updateData = {};
  if (req.body.allergies !== undefined) {
    updateData.allergies = req.body.allergies; 
  }
  if (req.body.portion !== undefined) {
    updateData.portion = req.body.portion;
  }
  if (req.body.cuisines !== undefined) {
    updateData.cuisines = req.body.cuisines;
  }
  if (req.body.dislikes !== undefined) {
    updateData.dislikes = req.body.dislikes;
  }
  if (req.body.calories !== undefined) {
    const calorieData = req.body.calories;
    if (calorieData && typeof calorieData === 'object' && calorieData !== null) {
      if (typeof calorieData.min === 'number') {
        updateData['profile.calories.min'] = calorieData.min;
      } else {
        console.warn("req.body.calories.min is missing or not a number:", calorieData.min);
      }
      if (typeof calorieData.max === 'number') {
        updateData['profile.calories.max'] = calorieData.max;
      } else {
        console.warn("req.body.calories.max is missing or not a number:", calorieData.max);
      }
    } else {
      console.warn("Received calories data is not a valid object:", calorieData);
    }
  }
  if (req.body.recipeCount !== undefined) {
    const recipeCountData = req.body.recipeCount;
    updateData['profile.recipes.wantToTry'] = recipeCountData;
  }
  if (req.body.frequency !== undefined) {
    updateData.frequency = req.body.frequency;
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error('No preference data provided for update.');
  }

  const userId = req.user._id;
  console.log("Extracted userId:", userId);
  console.log("Data to update:", updateData);

  try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

      console.log("Updated user:", updatedUser);
      if (!updatedUser) {
          res.status(404);
          throw new Error('User not found during preference update.');
      }

      res.status(200).json({ message: 'Preferences updated successfully' }); 
  } catch (err) {
      console.error("Error in updateUserPreferences:", err);
      res.status(500);
      throw new Error('Server error updating preferences.'); 
  }
};

//UPDATE: Update User by ID (Patch or Put)
//need to create a seperate route for password changes later
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, allergies, profile, avatar } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update top-level fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    if (allergies !== undefined) user.allergies = allergies;

    // Safely update profile subfields
    if (profile) {
      if (profile.calories) {
        user.profile.calories = {
          ...user.profile.calories,
          ...profile.calories
        };
      }
      if (profile.recipes) {
        user.profile.recipes = {
          ...user.profile.recipes,
          ...profile.recipes
        };
      }
      // Add more sub-objects as needed
    }

    const updatedUser = await user.save();

    // Return the updated user
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      allergies: updatedUser.allergies,
      profile: updatedUser.profile,
      recipes: updatedUser.recipes,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyCurrentUserPassword = asyncHandler(async (req, res) => {
  console.log("verifyCurrentUserPassword called");
  const { password } = req.body; 

  if (!password) {
      res.status(400);
      throw new Error('Password is required for verification');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
      res.status(404);
      throw new Error('User not found');
  }

  console.log("Verifying entered password for user:", user.email);

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
      console.log("Password verification failed.");
      res.status(401); // Unauthorized - incorrect password
      throw new Error('Incorrect password');
  }

  // Password matches! Send success response.
  console.log("Password verified successfully.");
  res.status(200).json({ message: 'Password verified successfully' });
});


//DELETE: Remove a User by ID
export const deleteUser = asyncHandler(async (req, res) => {
  console.log("deleteUser controller called for user ID:", req.user?._id);

  if (!req.user || !req.user._id) {
       res.status(401);
       throw new Error('Not authorized, user ID missing');
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
      res.status(404);
      throw new Error('User not found or already deleted');
  }

  const userEmail = user.email;

  const deleteResult = await User.deleteOne({ _id: userId });

  if (deleteResult.deletedCount === 0) {
       console.log(`Deletion failed for user: ${userEmail} (${userId}) - Already deleted?`);
       res.status(404);
       throw new Error('User not found or already deleted');
  }

  console.log(`User ${userEmail} (${userId}) deleted successfully`);
  res.status(200).json({ message: `Account deleted successfully` });
});

//LOGIN: log user in
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // Find the user by email

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, '7d');
      user.token = token;
      await user.save();
      return res.status(200).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          allergies: user.allergies,
          profile: user.profile,
          recipes: user.recipes,
        },
        token,
      });
      
    } else {
      // Invalid email or password
      res.status(401).json({ message: 'Invalid email or password' }); // 401 Unauthorized
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//PATCH: Add Recipe to User
export const addRecipeToUser = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the recipe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Add recipe ID to user's recipe array
    if (!user.recipes.includes(recipeId)) {
      user.recipes.push(recipeId);
      await user.save();
    }

    return res.json({ message: "Recipe added to user", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//fetching user's saved recipes
export const getSavedRecipes = async (req, res) => {
  try {
    // Find the user by ID and populate saved recipes
    const user = await User.findById(req.params.id).populate('savedRecipes');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!Array.isArray(user.savedRecipes) || user.savedRecipes.length === 0) {
      return res.json({ message: "No saved recipes found", savedRecipes: [] });
    }

    const API_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const API_KEY = process.env.EXPO_PUBLIC_EDAMAM_API_KEY;

    // Fetch full recipe details from Edamam API
    const recipeDetailsPromises = user.savedRecipes.map((uri) =>
      axios.get(`https://api.edamam.com/api/recipes/v2/by-uri?uri=${encodeURIComponent(uri)}&app_id=${API_ID}&app_key=${API_KEY}`)
    );

    const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
    const detailedRecipes = recipeDetailsResponses
      .map((response) => {
        if (!response.data || !response.data.hits || response.data.hits.length === 0) return null;

    // Access the recipe from the first hit
        const recipe = response.data.hits[0].recipe;
        return {
        uri: recipe.uri,
        label: recipe.label,
        image: recipe.image || "https://via.placeholder.com/150",
        directions: recipe.url || "No directions available.",
        ingredients: recipe.ingredientLines,
        allergies: recipe.healthLabels,
        nutrition: recipe.totalNutrients,
        mealType: recipe.mealType,
        cuisineType: recipe.cuisineType,
        calories: recipe.calories,
        dietLabels: recipe.dietLabels || [],
        healthLabels: recipe.healthLabels || [],
        cautions: recipe.cautions || [],
    };
  })
  .filter(Boolean); // Remove null values

    return res.json({ message: "Saved recipes fetched successfully", savedRecipes: detailedRecipes });
  } catch (error) {
    console.error("Error fetching saved recipes:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const saveRecipe = async (req, res) => {
  try {
      const { userId, recipeId } = req.body;

      if (!userId || !recipeId) {
          return res.status(400).json({ message: "User ID and Recipe ID are required." });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }

      //  Ensure `savedRecipes` is an array before updating
      if (!Array.isArray(user.savedRecipes)) {
          user.savedRecipes = []; // Initialize as an empty array if it's not already an array
      }
      
      //  Use `$addToSet` to prevent duplicates and ensure the field remains an array
      await User.findByIdAndUpdate(userId, {
          $addToSet: { savedRecipes: recipeId } //  Ensures it's added as part of an array
      });

      res.status(200).json({ message: "Recipe saved successfully!", savedRecipes: user.savedRecipes });
  } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

export const unsaveRecipe = async (req, res) => {
  try {
      const { userId, recipeId } = req.body;

      if (!userId || !recipeId) {
          return res.status(400).json({ message: "User ID and Recipe ID are required." });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }

      // Ensure `savedRecipes` is an array before updating
      if (!Array.isArray(user.savedRecipes)) {
          return res.status(400).json({ message: "No saved recipes to unsave." });
      }

      // Use `$pull` to remove the recipeId from the array
      await User.findByIdAndUpdate(userId, {
          $pull: { savedRecipes: recipeId } // Removes the specified recipeId from the array
      });

      res.status(200).json({ message: "Recipe unsaved successfully!" });
  } catch (error) {
      console.error("Error unsaving recipe:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecieById = async (req, res) => {
  try {
      const user = await User.findById(req.params.id); // Find recipe by ID
      if (!user) {
          return res.status(404).json({ message: 'Recipe not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getSavedPantry = async (req, res) => {
  try {
    // Find the user by ID and populate saved pantry ingredients
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!Array.isArray(user.savedPantry) || user.savedPantry.length === 0) {
      return res.json({ message: "No saved pantry ingredients found", savedPantry: [] });
    }

    const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
    const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;

    if (!API_ID || !API_KEY) {
      console.error("Missing API credentials");
      return res.status(500).json({message: "Server error: Missing API credentials"});
    }

    const pantryDetailsPromises = user.savedPantry.map(async ({ foodId, quantity }) => {
      try {                
        if (!foodId || typeof foodId !== "string") {
          console.error("Invalid foodId", foodId);
          return null;
        }

        const response = await axios.get(
          `https://api.edamam.com/api/food-database/v2/parser`,
          {
            params: {
              app_id: API_ID,
              app_key: API_KEY,
              ingr: foodId,
            },
            timeout: 10000,
          }
        );

        const foodData = response.data.hints[0]?.food;

        if (!foodData) {
          console.error("Food data not found for the given foodId");
          return null;
        }

        const label = foodData.label || "Unknown";
        const category = foodData.category || "Other";
        const nutrients = foodData.nutrients || {};
        const image = foodData.image || 'https://via.placeholder.com/150';

        console.log('Food details:', {foodId, label, category, nutrients, image, quantity});

        return {
          foodId, label, category, nutrients, image, quantity
        };
      } catch (err) {
        console.error(`Error fetching ingredient details for foodId ${foodId}:`, err.message);
        return null;
      }
    });

    const detailedPantry = (await Promise.all(pantryDetailsPromises)).filter(Boolean);

    return res.json({ 
      message: "Saved pantry ingredients fetched successfully",
      savedPantry: detailedPantry 
    });

  } catch (error) {
    console.error("Error fetching user's pantry ingredients recipes:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addIngredientToPantry = async (req, res) => {
    try {
      const { userId } = req.params;
        const { foodId, label, quantity } = req.body;

        if (!foodId || !label || quantity === undefined ) {
          return res.status(400).json({message: "Food id and quantity are missing"});
        }

        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({message: "User not found."});
        }
      
      const ingredientIdex = user.savedPantry.findIndex(item => item.foodId === foodId);

      if (ingredientIdex !== -1) {
        user.savedPantry[ingredientIdex].quantity = quantity;
        await user.save();
        console.log("Ingredient added or updated successfully");
        return res.status(200).json({message: "Pantry updated successfully!"});
      } else {
        user.savedPantry.push({ foodId, label, quantity});
        await user.save();
        console.log("Ingredient added or updated successfully");
        return res.status(200).json({message: "Pantry updated successfully!"});
      }
    } catch (err) {
      console.error("Error updating pantry:", err);
      return res.status(500).json({message: "Internal server error"});
    }
};

export const removeIngredientPantry = async (req, res) => {
  try {
    const { userId } = req.params;
    const { foodId } = req.body;

    if (!foodId) {
      return res.status(400).json({message: "Food ID is missing"});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    const ingredientIdex = user.savedPantry.findIndex(item => item.foodId === foodId);
    if (ingredientIdex === -1) {
      return res.status(404).json({message: "Ingredient not found."});
    }

    user.savedPantry.splice(ingredientIdex, 1);
    await user.save();
    return res.status(200).json({message: "Ingredient successfully removed."});

  } catch (err) {
    console.error("Error deleting pantry ingredient: ", err);
    return res.status(500).json({message: "Internal server error"});
  }
};

export const addIngredientToGrocery = async (req, res) => {
  try {
    const { userId } = req.params;
      const { foodId, label, quantity } = req.body;
      // console.log(req.body);

      if (!foodId || !label || quantity === undefined ) {
        return res.status(400).json({message: "Food id and quantity are missing"});
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({message: "User not found."});
      }
    
    const ingredientIdex = user.savedGrocery.findIndex(item => item.foodId === foodId);

    if (ingredientIdex !== -1) {
      user.savedGrocery[ingredientIdex].quantity = quantity;
      await user.save();
      console.log("Ingredient added or updated successfully");
      return res.status(200).json({message: "Grocery updated successfully!"});
    } else {
      user.savedGrocery.push({ foodId, label, quantity});
      await user.save();
      console.log("Ingredient added or updated successfully");
      return res.status(200).json({message: "Grocery updated successfully!"});
    }
  } catch (err) {
    console.error("Error updating pantry:", err);
    return res.status(500).json({message: "Internal server error"});
  }
};

export const getSavedGrocery = async (req, res) => {
  try {
    // Find the user by ID and populate saved pantry ingredients
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!Array.isArray(user.savedGrocery) || user.savedGrocery.length === 0) {
      return res.json({ message: "No saved pantry ingredients found", savedGrocery: [] });
    }

    const API_ID = process.env.EXPO_PUBLIC_FOODDB_ID;
    const API_KEY = process.env.EXPO_PUBLIC_FOODDB_KEY;

    if (!API_ID || !API_KEY) {
      console.error("Missing API credentials");
      return res.status(500).json({message: "Server error: Missing API credentials"});
    }

    const groceryDetailsPromises = user.savedGrocery.map(async ({ foodId, quantity }) => {
      try {                
        if (!foodId || typeof foodId !== "string") {
          console.error("Invalid foodId", foodId);
          return null;
        }

        const response = await axios.get(
          `https://api.edamam.com/api/food-database/v2/parser`,
          {
            params: {
              app_id: API_ID,
              app_key: API_KEY,
              ingr: foodId,
            },
            timeout: 10000,
          }
        );

        const foodData = response.data.hints[0]?.food;

        if (!foodData) {
          console.error("Food data not found for the given foodId");
          return null;
        }

        const label = foodData.label || "Unknown";
        const category = foodData.category || "Other";
        const nutrients = foodData.nutrients || {};
        const image = foodData.image || 'https://via.placeholder.com/150';

        console.log('Food details:', {foodId, label, category, nutrients, image, quantity});

        return {
          foodId, label, category, nutrients, image, quantity
        };
      } catch (err) {
        console.error(`Error fetching ingredient details for foodId ${foodId}:`, err.message);
        return null;
      }
    });

    const detailedGrocery = (await Promise.all(groceryDetailsPromises)).filter(Boolean);

    return res.json({ 
      message: "Saved pantry ingredients fetched successfully",
      savedGrocery: detailedGrocery 
    });

  } catch (error) {
    console.error("Error fetching user's pantry ingredients recipes:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const batchRemoveIngredientGrocery = async (req, res) => {
  try {
    const { userId } = req.params;
    const { foodIds } = req.body;

    if (!foodIds || !Array.isArray(foodIds)) {
      return res.status(400).json({message: "Invalid request format. Expected array of foodIds"});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    const result = await User.updateOne(
      {_id: userId},
      { $pull: { savedGrocery: { foodId: { $in: foodIds } } } }
    )

    if (result.nModified === 0) {
      return res.status(404).json({message: "No ingredient found to remove"})
    } 
    return res.status(200).json({message: "Ingredient successfully removed."});

  } catch (err) {
    console.error("Error deleting pantry ingredient: ", err);
    return res.status(500).json({message: "Internal server error"});
  }
}

export const removeIngredientGrocery = async (req, res) => {
  try {
    const { userId } = req.params;
    const { foodId } = req.body;

    if (!foodId) {
      return res.status(400).json({message: "Food ID is missing"});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    const ingredientIdex = user.savedGrocery.findIndex(item => item.foodId === foodId);
    if (ingredientIdex === -1) {
      return res.status(404).json({message: "Ingredient not found."});
    }

    user.savedGrocery.splice(ingredientIdex, 1);
    await user.save();
    return res.status(200).json({message: "Ingredient successfully removed."});

  } catch (err) {
    console.error("Error deleting pantry ingredient: ", err);
    return res.status(500).json({message: "Internal server error"});
  }
};
// REQUEST PASSWORD RESET
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  console.log("forgotPasswordRequest called for email:", req.body.email);
  const { email } = req.body;

  if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email });

  if (user) {
    const resetToken = user.getPasswordResetToken(); // Get UNHASHED numeric code
    try {
      await user.save({ validateBeforeSave: false }); // Save HASHED code + expiry
      console.log(`Generated reset code (unhashed - FOR EMAIL): ${resetToken}`);
      console.log(`Saved hashed code to user ${user.email}`);

      const message = `
        You requested a password reset for your ByteMe account.

        Your password reset code is: ${resetToken}

        Enter this code in the app to reset your password.

        If you did not request this, please ignore this email.
        This code is valid for 10 minutes.`;

      await sendEmail({
          email: user.email,
          subject: 'ByteMe Password Reset Code',
          message
      });

      console.log("Password reset CODE email initiated for:", user.email);

    } catch(error) {
      console.error("Error saving user token or sending email:", error);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Failed to clear reset token after error:", saveError); }
    }
  } else {
     console.log(`Password reset requested for non-existent email: ${email}`);
  }

  res.status(200).json({ message: 'If an account with that email exists, a password reset code has been sent.' });
});

// RESET PASSWORD (Uses Token)
export const resetPassword = asyncHandler(async (req, res) => {
  console.log("resetPassword called with body:", req.body); // Log incoming data
    // Expect email, code (numeric string), and newPassword
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        res.status(400);
        throw new Error('Please provide email, reset code, and new password');
    }
    if (typeof code !== 'string' || code.length < 4 || code.length > 6 || !/^\d+$/.test(code)) { // Basic validation for a 4-6 digit code
        res.status(400);
        throw new Error('Invalid code format');
    }

    // Hash the numeric code received from the request body
    const hashedCode = crypto
        .createHash('sha256')
        .update(code) // Hash the numeric code from the request
        .digest('hex');

    console.log("Searching for user with email:", email);
    console.log("Searching with hashed code:", hashedCode);

    // Find user by email, HASHED code, and expiry date
    const user = await User.findOne({
        email: email,
        passwordResetToken: hashedCode, // Compare HASHED codes
        passwordResetExpires: { $gt: Date.now() }, // Check if token hasn't expired
    });

    // Check if user found and code is valid/not expired
    if (!user) {
        console.log("User not found or code invalid/expired for email:", email);
        res.status(400); // Bad Request
        throw new Error('Invalid or expired password reset code');
    }

    // Code is valid. Set the new password (pre-save hook will hash it)
    user.password = newPassword;
    user.passwordResetToken = undefined; // Clear the reset code fields
    user.passwordResetExpires = undefined;
    await user.save(); // Save the user with the new password and cleared token

    console.log(`Password successfully reset for user: ${user.email}`);

    // Send Success Response
    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
});

export const updateUserPassword = asyncHandler(async(req, res) => {
  console.log("updateUserPassword called");
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords');
  }

  // if (newPassword.length < 6) {
  //   res.status(400);
  //   throw new Error('New password must be at least 6 characters long');
  // }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  console.log("Verifying current password for user:", user.email);

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    console.log("Current password does nat match");
    res.status(401);
    throw new Error('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  console.log(`Password updated successfully for user: ${user.email}`);
  res.status(200).json({ message: 'Password updated successfully' });
});

export const saveCalendarDayForUser = async (req, res) => {
  const { userId } = req.params;
  const { date, meals, totalCalories } = req.body;

  if (!date || !Array.isArray(meals)) {
    return res.status(400).json({ message: "Date and meals are required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const existingDayIndex = user.savedDays.findIndex(day => day.date === date);

    const newDay = { date, meals, totalCalories };

    if (existingDayIndex !== -1) {
      user.savedDays[existingDayIndex] = newDay;
    } else {
      user.savedDays.push(newDay);
    }

    await user.save();

    console.log(`Preparing save confirmation email for ${user.email} for date ${date}`);
    const emailSubject = `Your ByteMe Meal Plan for ${date} is Saved!`;

    let emailMessage = `Hello ${user.name || 'User'},\n\n`;
    emailMessage += `Your meal plan for ${date} has been successfully saved.\n\n`;
    emailMessage += "Here's what was saved:\n";

    if (meals && meals.length > 0) {
      meals.forEach(mealItem => {
          const mealType = mealItem.meal ? mealItem.meal.charAt(0).toUpperCase() + mealItem.meal.slice(1) : 'Meal';
          const label = mealItem.recipeLabel || 'Unnamed Meal';
          emailMessage += `- ${mealType} (${mealItem.time || 'No time'}): ${label}\n`;
      });
    } else {
      emailMessage += "- No specific meals were saved for this date.\n";
    }

    emailMessage += `\nTotal Calories: ${totalCalories || 0}\n`;
    emailMessage += "\nEnjoy your meals!\n\nThe ByteMe Team";

    const emailOptions = {
        email: user.email,
        subject: emailSubject,
        message: emailMessage
    };

    console.log("Prepared emailOptions:", emailOptions);

    const sendThisEmail = user.settings?.emailNotifications?.saveConfirmation !== false;
    if (sendThisEmail) {
      try {
        console.log(`Attempting to send save confirmation to ${emailOptions.email}...`);
        const emailSent = await sendEmail(emailOptions);

        if (emailSent) {
          console.log("Save confirmation email queued successfully.");
        } else {
          console.error("sendEmail utility returned false, check its logs for details.");
        }
      } catch (emailError) {
        console.error("Failed to send save confirmation email due to unexpected error:", emailError);
      }
    } else {
      console.log(`Skipping save confirmation email for ${user.email} based on user settings.`);
    }

  console.log("Save operation successful, sending response to client.");
  return res.status(200).json({
    message: "Calendar day saved successfully!",
    savedDays: user.savedDays
  });

  } catch (error) {
    console.error("Save day error:", error);
    return res.status(500).json({ message: "Server error saving calendar day" });
  }
};

export const getUserSavedDays = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.savedDays) return res.json({ savedDays: [] });

    res.json({ savedDays: user.savedDays });
  } catch (err) {
    res.status(500).json({ message: "Failed to load saved days" });
  }
};

export const deleteCalendarDayForUser = async (req, res) => {
  const { userId } = req.params;
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: "Date is required to delete." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.savedDays = user.savedDays.filter(day => day.date !== date);
    await user.save();

    res.status(200).json({ message: "Day deleted successfully." });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete day." });
  }
};

export const markMealCompleted = async (req, res) => {
  const { userId } = req.params;
  const { date, time } = req.body; // we pass which day and which time slot

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const day = user.savedDays.find((d) => d.date === date);
    if (!day) return res.status(404).json({ message: "Day not found." });

    const meal = day.meals.find((m) => m.time === time);
    if (!meal) return res.status(404).json({ message: "Meal not found." });

    meal.completed = true; // ✅ mark it completed

    await user.save();
    res.status(200).json({ message: "Meal marked as completed!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark meal completed." });
  }
};

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { saveConfirmation } = req.body;

  if (typeof saveConfirmation !== 'boolean') {
    res.status(400);
    throw new Error("Invalid value provided for 'saveConfirmation' setting. A boolean (true/false) is required.");
  }

  console.log(`Attempting to update saveConfirmation for user ${userId} to: ${saveConfirmation}`);

  try {
    const updatePayload = {
      $set: {
        'settings.emailNotifications.saveConfirmation': saveConfirmation
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      {
          new: true,
          runValidators: true
      }
    ).select('settings email name');

    if (!updatedUser) {
      res.status(404);
      throw new Error('User not found during settings update.');
    }

    console.log(`Settings updated successfully for user: ${updatedUser.email}`);

    res.status(200).json({
      message: 'Notification settings updated successfully.',
      updatedSettings: updatedUser.settings
    });

} catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500); // Set status code
    throw new Error(`Server error updating settings: ${error.message}`);
}
});

export const tryNewRecipe = async (req, res) => {
  const { userId, recipeId, title, calories } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date().toISOString().split('T')[0];

    const mealEntry = {
      meal: 'Tried Recipe',
      recipeId,
      recipeLabel: title || 'Untitled',
      calories: Number(calories) || 0,
      time: new Date().toISOString(),
    };

    let todayEntry = user.savedDays.find(day => day.date === today);

    if (todayEntry) {
      todayEntry.meals.push(mealEntry);
      todayEntry.totalCalories = Number(todayEntry.totalCalories || 0) + Number(calories || 0);
    } else {
      user.savedDays.push({
        date: today,
        totalCalories: Number(calories) || 0,
        meals: [mealEntry],
      });
    }

    user.markModified('savedDays');

    await user.save();
    return res.status(200).json({ message: 'Recipe logged successfully' });
  } catch (err) {
    console.error('[tryNewRecipe] Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};