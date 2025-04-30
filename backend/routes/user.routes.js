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
  getSavedPantry,
  addIngredientToPantry,
  removeIngredientPantry,
  addIngredientToGrocery,
  getSavedGrocery,
  batchRemoveIngredientGrocery,
  removeIngredientGrocery,
  forgotPasswordRequest,
  resetPassword,
  updateUserPassword,
  verifyCurrentUserPassword,
  verifyUserEmail,
  
  getUserSavedDays,
  unsaveRecipe,
  saveCalendarDayForUser,
  markMealComplete,
  tryNewRecipe,
  getUpdatedProfile
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

// VERIFY EMAIL: user
router.get('/verify/:token', verifyUserEmail);

// READ: Get current user's profile by JWT
router.get('/profile/:token', authenticateJWT, getUserProfile);

//UPDATE: user allergies by ID
router.patch('/preferences', authenticateJWT, updateUserPreferences);

//UPDATE: user password
router.patch('/profile/password', authenticateJWT, updateUserPassword);

//READ: get all users (may want admin-only or we remove in production)
// router.get('/', getAllUsers);

//READ: get single user by ID
router.get('/:id', getUserById);

//UPDATE: user by ID
router.patch('/:id', updateUser);

// Route to verify current password
router.post('/verify-password', authenticateJWT, verifyCurrentUserPassword);

//DELETE: user by ID
// router.delete('/:id', deleteUser);
router.delete('/profile', authenticateJWT, deleteUser);

//Add recipe to user
router.patch('/:userId/add-recipe/:recipeId', addRecipeToUser);

//fetching saved recipe
router.get("/:id/get-saved-recipes", getSavedRecipes);

//save the recipe
router.post("/save-recipe", saveRecipe);

//removing saved recipe 
router.delete("/remove/remove-recipe", unsaveRecipe);

router.get("/:id/get-saved-pantry", getSavedPantry);

router.put('/:userId/update-pantry', addIngredientToPantry);

router.delete('/:userId/remove-pantry', removeIngredientPantry);

router.put('/:userId/update-grocery', addIngredientToGrocery);

router.get("/:id/get-saved-grocery", getSavedGrocery);

router.delete('/:userId/batch-remove-grocery', batchRemoveIngredientGrocery);

router.delete('/:userId/remove-grocery', removeIngredientGrocery)
//Save calendar day for a user
router.post('/:userId/save-day', saveCalendarDayForUser);

// GET saved-days
router.get('/:userId/saved-days', getUserSavedDays);

//Markmeal as complete
router.post('/meal-completed', markMealComplete)
//Mark new recipe tried
router.post('/recipe-tried', tryNewRecipe)

router.get('/profile/updated/sync', authenticateJWT, getUpdatedProfile);
export default router;
