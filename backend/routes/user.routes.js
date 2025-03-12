// import express from "express"
// import { loginUser, registerUser } from "../controllers/user.controller.js"

// const router = express.Router();

// router.get("/register", async (req, res) => {
//     registerUser();
// });

// router.get("/login", async(req, res) => {
//     loginUser();
// });

// module.exports = router;

import express from 'express';
import {
  createUser,
  loginUser,
  addRecipeToUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

//CREATE: register new user
router.post('/', createUser);

//READ: get all users (may want admin-only or we remove in production)
router.get('/', getAllUsers);

//READ: get single user by ID
router.get('/:id', getUserById);

//UPDATE: user by ID
router.patch('/:id', updateUser);

//DELETE: user by ID
router.delete('/:id', deleteUser);

//LOGIN: user
router.post('/login', loginUser);

//Add recipe to user
router.patch('/:userId/add-recipe/:recipeId', addRecipeToUser);

export default router;

