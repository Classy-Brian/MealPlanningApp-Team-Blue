import express from "express";
import {
    SavedRecipes, getUserById, saveRecipe
} from "../controllers/user.controller.js"

const router = express.Router();

router.get("/:id", getUserById)
router.get("/:id/saved-recipes", SavedRecipes);
router.post("/save-recipe", saveRecipe);

export default router;