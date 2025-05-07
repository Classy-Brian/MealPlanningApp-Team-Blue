import express from 'express';
import { chatWithAI,
     getMealPlanFromEdamam,
     generateStructuredMealPlan, getPantrySuggestions } from '../controllers/AI.controller.js';
const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/generate-plan', getMealPlanFromEdamam);
router.post('/generate-structured-plan/', generateStructuredMealPlan);
router.post('/:userId/generate-pantry-suggestions/', getPantrySuggestions);

export default router;
