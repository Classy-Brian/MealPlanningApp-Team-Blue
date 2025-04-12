import express from 'express';
import { getMealPlanFromAI } from '../controllers/AI.controller.js';
const router = express.Router();

router.post('/generate-plan/', getMealPlanFromAI);

export default router;
