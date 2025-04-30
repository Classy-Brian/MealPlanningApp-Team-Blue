import express from 'express';
<<<<<<< HEAD
import { chatWithAI, 
    getMealPlanFromEdamam, 
    getMealPlanFromAI, 
    generateStructuredMealPlan, 
    getPantrySuggestions,
    // generateFromPantry,
} from '../controllers/AI.controller.js';

=======
import { getMealPlanFromAI, generateStructuredMealPlan, getPantrySuggestions } from '../controllers/AI.controller.js';
>>>>>>> parent of 9689476 (Merge branch 'TrungLe' into Brian)
const router = express.Router();

router.post('/generate-plan/', getMealPlanFromAI);

router.post('/generate-structured-plan/', generateStructuredMealPlan);
router.post('/:userId/generate-pantry-suggestions/', getPantrySuggestions);

export default router;
