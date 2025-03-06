import express from "express";
import {
    getSavedRecipes
} from "../controllers/user.controller.js"

const router = express.Router();


router.get("/:id", getSavedRecipes);

export default router;