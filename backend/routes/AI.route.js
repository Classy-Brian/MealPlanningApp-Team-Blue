import express from 'express';
import { chatWithAI,
    getMealPlanFromEdamam,
    // generateFromPantry
 } from '../controllers/AI.controller.js';
const router = express.Router();


router.post('/chat', chatWithAI);
router.post('/generate-plan', getMealPlanFromEdamam);
// router.post('/generate-from-pantry', generateFromPantry);

export default router;
