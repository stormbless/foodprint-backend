import express from 'express'; 
import type { Request, Response } from 'express';


import authController from '../controllers/auth-controller.js';
import authMiddleware from '../middlewares/auth.js';


const router = express.Router();

router.post('/api/login', authController.login);
router.post('/api/authenticate-access-token', authMiddleware.authenticateAccessToken, (_req: Request, res: Response) => {
  res.status(200).send();
});
router.post('/api/refresh-token', authMiddleware.authenticateRefreshToken, authController.refreshToken);
router.post('/api/logout', authMiddleware.authenticateAccessToken, authController.logout);


export default router;