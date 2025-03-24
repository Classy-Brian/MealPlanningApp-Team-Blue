import express from "express";
import {
    getSavedRecipes, 
    getUserById, 
    saveRecipe,
    unsaveRecipe
} from "../controllers/user.controller.js"

const router = express.Router();

router.get("/:id", getUserById)
router.get("/:id/get-saved-recipes", getSavedRecipes);
router.post("/save-recipe", saveRecipe);
router.delete("/remove-recipe", unsaveRecipe);

export default router;