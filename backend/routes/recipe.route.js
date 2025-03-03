import express from "express";

import { getRecipes } from "../controllers/recipe.controller.js";

const router = express.Router();

router.get("/", getRecipes);

export default router;