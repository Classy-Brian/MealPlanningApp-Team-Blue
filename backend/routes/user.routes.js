import express from 'express';
import {
  createUser,
  loginUser,
  addRecipeToUser,
  getAllUsers,
  getUserById,
  updateUserPreferences,
  updateUser,
  deleteUser,
  getUserProfile,
  getSavedRecipes, 
  saveRecipe,
  unsaveRecipe,
  forgotPasswordRequest,
  resetPassword,
  
} from '../controllers/user.controller.js';
import authenticateJWT from './authMiddleware.js';

const router = express.Router();

//CREATE: register new user
router.post('/', createUser);

//LOGIN: user
router.post('/login', loginUser);

// FORGET PASSWORD: user
router.post('/forgot-password', forgotPasswordRequest);

// RESET PASSWORD: user
router.post('/reset-password', resetPassword);

// READ: Get current user's profile by JWT
router.get('/profile/:token', authenticateJWT, getUserProfile);

//UPDATE: user allergies by ID
router.patch('/preferences', authenticateJWT, updateUserPreferences);

//READ: get all users (may want admin-only or we remove in production)
// router.get('/', getAllUsers);

//READ: get single user by ID
router.get('/:id', getUserById);

//UPDATE: user by ID
router.patch('/:id', updateUser);

//DELETE: user by ID
router.delete('/:id', deleteUser);

//Add recipe to user
router.patch('/:userId/add-recipe/:recipeId', addRecipeToUser);

//fetching saved recipe
router.get("/:id/get-saved-recipes", getSavedRecipes);

//save the recipe
router.post("/save-recipe", saveRecipe);

//removing saved recipe 
router.delete("/remove/remove-recipe", unsaveRecipe);


export default router;
