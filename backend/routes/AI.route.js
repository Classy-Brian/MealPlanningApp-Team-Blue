import express from 'express';
import { getMealPlanFromAI, generateStructuredMealPlan } from '../controllers/AI.controller.js';
const router = express.Router();

router.post('/generate-plan/', getMealPlanFromAI);

router.post('/generate-structured-plan/', generateStructuredMealPlan);

export default router;
