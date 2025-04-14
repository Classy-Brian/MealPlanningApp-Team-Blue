import express from 'express';
import { getMealPlanFromAI } from '../controllers/AI.controller.js';
import { getPantrySuggestions } from '../controllers/AI.controller.js';
const router = express.Router();

router.post('/generate-plan/', getMealPlanFromAI);

router.post('/:userId/generate-pantry-suggestions', getPantrySuggestions);

export default router;
