import express from 'express';
import { chatWithAI, 
    getMealPlanFromEdamam, 
    getMealPlanFromAI, 
    generateStructuredMealPlan, 
    getPantrySuggestions,
    // generateFromPantry,
} from '../controllers/AI.controller.js';

import { chatWithAI,
    getMealPlanFromEdamam,
    // generateFromPantry
 } from '../controllers/AI.controller.js';

const router = express.Router();


router.post('/chat', chatWithAI);
router.post('/generate-plan', getMealPlanFromEdamam);
// router.post('/generate-from-pantry', generateFromPantry);

router.post('/generate-structured-plan/', generateStructuredMealPlan);
router.post('/:userId/generate-pantry-suggestions/', getPantrySuggestions);

export default router;
