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