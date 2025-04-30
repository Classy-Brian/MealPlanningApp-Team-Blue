import express from 'express';
import { getMealPlanFromAI, generateStructuredMealPlan, getPantrySuggestions } from '../controllers/AI.controller.js';
const router = express.Router();

router.post('/generate-plan/', getMealPlanFromAI);

router.post('/generate-structured-plan/', generateStructuredMealPlan);
router.post('/:userId/generate-pantry-suggestions/', getPantrySuggestions);

export default router;
