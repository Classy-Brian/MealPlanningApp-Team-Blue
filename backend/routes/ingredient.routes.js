import express from "express";
import {
    getRecipes,
    createIngredient,
    getAllIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient
} from "../controllers/ingredient.controller.js"

const router = express.Router();

router.get("/", getRecipes); // Edamam API route

// CRUD routes
router.post("/", createIngredient); 
router.get("/all", getAllIngredients);
router.get("/:id", getIngredientById);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;