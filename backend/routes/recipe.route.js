import express from "express";
import {
    getRecipes,
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} from "../controllers/recipe.controller.js"

const router = express.Router();

router.get("/", getRecipes); // Edamam API route

// CRUD routes
router.post("/", createRecipe); 
router.get("/all", getAllRecipes);
router.get("/:id", getRecipeById);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;