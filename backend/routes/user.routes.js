// backend/routes/user.routes.js
import express from 'express';
import { createUser, loginUser, addRecipeToUser } from '../controllers/user.controller.js';

const router = express.Router();

// Create user (POST /api/users)
router.post('/', createUser);

// Login user (POST /api/users/login)
router.post('/login', loginUser);

// PATCH /api/users/:userId/add-recipe/:recipeId
router.patch("/:userId/add-recipe/:recipeId", addRecipeToUser);

export default router;
