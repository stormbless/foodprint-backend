import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import ms from 'ms';

interface jwtPayload {
  userEmail: string
}

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXP as ms.StringValue;
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXP as ms.StringValue;

function generateAccessToken(userEmail: string): string {
  return jwt.sign({ userEmail }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: ACCESS_EXP });
}

function generateRefreshToken(userEmail: string): string {
  return jwt.sign({ userEmail }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: REFRESH_EXP });
}

function authenticateTokenCookie(req: Request, res: Response, next: NextFunction, tokenType: string): void {  
  const token: string = req.cookies[tokenType + '_token'];

  console.log('authenticating ' + tokenType + ' token');

  if (token === undefined || token === null) { 
    console.log(`${tokenType} Token not in cookie`) 

    res.status(401).send(`${tokenType} Token not in cookie`); 
    return; 
  }

  try {
    const { userEmail } = jwt.verify(token, process.env[tokenType.toUpperCase() + '_TOKEN_SECRET'] as string) as jwtPayload;
    
    console.log('valid ' + tokenType + ' token');
    
    req.userEmail = userEmail;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).send(`Invalid or expired ${tokenType} token`);
  }
}

function authenticateAccessToken(req: Request, res: Response, next: NextFunction): void {  
  authenticateTokenCookie(req, res, next, "access");
}

function authenticateRefreshToken(req: Request, res: Response, next: NextFunction): void {  
  authenticateTokenCookie(req, res, next, "refresh");
}

export default {
  generateAccessToken,
  generateRefreshToken,
  authenticateAccessToken,
  authenticateRefreshToken
};