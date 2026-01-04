import express from 'express'; 

import impactController from '../controllers/impact-controller.js';
import authMiddleware from '../middlewares/auth.js';


const router = express.Router();


router.get('/api/dashboard-data', authMiddleware.authenticateAccessToken, impactController.getDashboardData);


export default router;