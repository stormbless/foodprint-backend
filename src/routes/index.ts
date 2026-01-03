import express from 'express'; 
import type { Request, Response } from 'express';

const router = express.Router();

import authRoutes from './auth.js';
import impactRoutes from './impact.js';

router.use(authRoutes);
router.use(impactRoutes);

router.get('/', function (_req: Request, res: Response) {
  res.send('<h1>Backend for FoodPrint.</h1>');
})

router.get('/get-health', function (_req: Request, res: Response) {
  res.send({ health: 'healthy' });
})

export default router;

// api endpoints

// auth route

// login, 
// logout, 

// env impact data route

// impact over time data (3)
// food breakdown data (4 + 5)
// total impact data  (6 + 7)
// impact / kg for specific food