import User from '../models/user.model.js'; 
import Recipe from '../models/recipe.model.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import axios from 'axios'
import crypto from 'crypto'; 

dotenv.config();
const JWT_SECRET = `${process.env.JWT_SECRET}` 

// GENERATE a JWT token
const generateToken = (userId, time) => {
  return jwt.sign({_id: userId}, JWT_SECRET, {expiresIn: time});
}


//CREATE: Register a new User
export const createUser = async (req, res) => {
  console.log("Recieved registration request:", req.body);
  
  try {
    const { name, email, password, allergies, portion, profile, avatar } = req.body;

    // Check if user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user document
    const user = await User.create({
      name,
      email,
      avatar,
      password,
      allergies,
      portion,
      profile
    });

    // Create a JSON web token
    const token = generateToken(user._id, '1h') // The token expires in 1 hour
    user.token = token;
    await user.save();

    // Return the created user
    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        allergies: user.allergies,
        portion: user.portion,
        profile: user.profile,
        recipes: user.recipes,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
    .populate('recipes')
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
      const token = generateToken(user._id, '7d'); // <- Error happens here
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
    const user = await User.findById(req.params.id);

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
        const { foodId, quantity } = req.body;

        if (!foodId || quantity === undefined ) {
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
        user.savedPantry.push({ foodId, quantity});
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
      const { foodId, quantity } = req.body;

      if (!foodId || quantity === undefined ) {
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
      user.savedGrocery.push({ foodId, quantity});
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
// REQUEST PASSWORD RESET (Generates Token, NO EMAIL SENT YET)
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  console.log("forgotPasswordRequest called for email:", req.body.email);
  const { email } = req.body;

  if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If an account with that email exists, password reset instructions have been sent (mock).' });
  }

  const resetToken = user.getPasswordResetToken(); 
  await user.save({ validateBeforeSave: false });

  console.log(`Generated reset token (unhashed - FOR TESTING ONLY): ${resetToken}`);
  console.log(`Saved hashed token to user ${user.email}`);

  // --- MOCK RESPONSE (FOR TESTING WITHOUT EMAIL) ---
  res.status(200).json({
      message: 'Password reset token generated (mock - normally emailed). Use this token to reset.',
      resetToken: resetToken 
  });
  // --- END MOCK RESPONSE ---

  /*
  // --- REAL EMAIL SENDING LOGIC (For later) ---
  try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`; // Link to your frontend reset page
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n This link is valid for 10 minutes.`;

      await sendEmail({
          email: user.email,
          subject: 'ByteMe Password Reset Token',
          message
      });
      res.status(200).json({ message: 'Password reset instructions sent to your email.' });
  } catch(emailError) {
      console.error("Error sending password reset email:", emailError);
      user.passwordResetToken = undefined; // Clear fields on email failure
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new Error('Email could not be sent'); // Let asyncHandler handle response
  }
  */
});

// RESET PASSWORD (Uses Token)
export const resetPassword = asyncHandler(async (req, res) => {
  console.log("resetPassword called");
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
      res.status(400);
      throw new Error('Please provide email, reset token, and new password');
  }

  // Hash the token received from the request body
  const hashedToken = crypto
      .createHash('sha256')
      .update(token) // Hash the UNHASHED token from the request
      .digest('hex');

  console.log("Searching for user with email:", email);
  console.log("Searching with hashed token:", hashedToken);

  // Find user by email, HASHED token, and expiry date
  const user = await User.findOne({
      email: email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid
  });

  // Check if user found and token is valid
  if (!user) {
    console.log("User not found or token invalid/expired");
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // // Basic password length validation
  // if (newPassword.length < 6) {
  //   res.status(400);
  //   throw new Error('Password must be at least 6 characters long');
  // }

  // Set the new password (pre-save hook will hash it)
  user.password = newPassword;
  user.passwordResetToken = undefined; // Clear the reset token fields
  user.passwordResetExpires = undefined;
  await user.save(); // Save the user with the new password and cleared token

  console.log(`Password successfully reset for user: ${user.email}`);

  // Generate a new LOGIN JWT token immediately? Or force user to log in again?
  // For simplicity now, just send success message.
  res.status(200).json({ message: 'Password reset successful!' });
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
