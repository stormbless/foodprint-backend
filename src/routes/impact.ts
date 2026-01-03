import express from 'express'; 

import impactController from '../controllers/impact-controller.js';
import authMiddleware from '../middlewares/auth.js';


const router = express.Router();

router.get('/api/impact-over-time', authMiddleware.authenticateAccessToken, impactController.getImpactOverTime);
router.get('/api/impact-summary', authMiddleware.authenticateAccessToken, impactController.getImpactSummary);
router.get('/api/food-impacts', authMiddleware.authenticateAccessToken, impactController.getFoodImpacts);




export default router;