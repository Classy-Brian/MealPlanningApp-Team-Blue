import express from "express";
import {
    getSavedRecipes, getUserById, saveRecipe
} from "../controllers/user.controller.js"

const router = express.Router();

router.get("/:id", getUserById)
router.get("/:id/get-saved-recipes", getSavedRecipes);
router.post("/save-recipe", saveRecipe);

export default router;