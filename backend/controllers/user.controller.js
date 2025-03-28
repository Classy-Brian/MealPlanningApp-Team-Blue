import User from '../models/user.model.js'; 
import Recipe from '../models/recipe.model.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import axios from 'axios'
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
    const { name, email, password, allergies, profile, avatar } = req.body;

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

// export const getUserProfile = async (req, res) => {
//   console.log("getUserProfile called");
//   console.log("req.user:", req.user);

//   const user = await User.findById(req.user._id).select('-password');

//   if (user) {
//     res.json(user);
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
// };

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
  const { allergies } = req.body;
  const userId = req.user._id;  // Extracted from token

  try {
    await User.findByIdAndUpdate(userId, { allergies }, { new: true });
    return res.status(200).json({ message: 'Allergies updated successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error'});
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


//DELETE: Remove a User by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    return res.json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
