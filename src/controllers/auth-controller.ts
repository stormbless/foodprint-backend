import type { CookieOptions, Request, Response } from 'express';
import ms from 'ms';

import cronometerService from '../services/cronometer-service.js';
import transformationService from '../services/transformation-service.js';
import FoodEntryModel from '../models/FoodEntryModel.js';
import FoodModel from '../models/FoodModel.js'

import authMiddleware from '../middlewares/auth.js';

//..................PRIVATE METHODS............

function userDetailsValid(userEmail: string, userPassword: string): boolean {
  const isEmail: RegExp = /^\S+@\S+\.\S+$/;

  if (!userEmail) {
    return false;
  }
  if (!isEmail.test(userEmail)) {
    return false;
  }
  
  if (!userPassword) {
    return false;
  }
  if (userPassword.length < 12) {
    return false;
  }
  if (typeof userPassword !== 'string') {
    return false;
  }

  return true;
}

function getCookieOptions(exp: string): CookieOptions {
  const cookie = { 
    maxAge: ms(exp as ms.StringValue),
    httpOnly: true, 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax',
    secure: process.env.NODE_ENV === 'production', 
    path: '/' 
  }

  return cookie;
}

function getAccessCookieOptions(): CookieOptions {
  return getCookieOptions(process.env.ACCESS_TOKEN_EXP as string);
}

function getRefreshCookieOptions(): CookieOptions {
  return getCookieOptions(process.env.ACCESS_TOKEN_EXP as string);
}

//..................PUBLIC METHODS............

async function login(req: Request, res: Response) {
  console.time('login');
  try {
    const userEmail: string = req.body.userEmail; 
    const userPassword: string = req.body.userPassword;

    if (!userDetailsValid(userEmail, userPassword)) {
      console.log('userDetails invalid');
      return res.status(500).send('userDetails invalid');
    }
    
    try {
      console.time('fetchServings');
      const servings = await cronometerService.fetchServings(userEmail, userPassword);
      console.timeEnd('fetchServings');

      console.time('transform servings');
      const foodEntries = await transformationService.transformServingstoFoodEntries(userEmail, servings);
      console.timeEnd('transform servings');

      // reset user's food entries (clear them and then insert updated ones)
      console.time('deleteFoodEntries');
      await FoodEntryModel.deleteFoodEntries({ userEmail: userEmail });
      console.timeEnd('deleteFoodEntries');

      console.time('insertFoodEntries');
      await FoodEntryModel.insertFoodEntries(foodEntries);
      console.timeEnd('insertFoodEntries');

    } catch (error) {
      console.error(error);
      // if user details incorrect, fetch_servings.py will throw error 
      // which then rejects the promise returned by fetchServings
      return res.status(403).send('authentication failed');
    }

    console.time('getAllImpacts');
    const foodImpactsPerKg = await FoodModel.getAllFoodsImpactPerKg();
    console.timeEnd('getAllImpacts');
    
    const accessToken = authMiddleware.generateAccessToken(userEmail);
    const refreshToken = authMiddleware.generateRefreshToken(userEmail);

    console.timeEnd('login');
    // send cookie, userEmail and list of foods to frontend 
    // food impacts used in substitution page in frontend
    return res
      .cookie('access_token', accessToken, getAccessCookieOptions())
      .cookie('refresh_token', refreshToken, getRefreshCookieOptions())
      .status(200).send({ userEmail: userEmail, foodImpactsPerKg: foodImpactsPerKg })
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}

// refresh access token and refresh token and send back as cookies
async function refreshToken(req: Request, res: Response) {
  const accessToken = authMiddleware.generateAccessToken(req.userEmail as string);
  const refreshToken = authMiddleware.generateRefreshToken(req.userEmail as string);

  res
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .cookie('access_token', accessToken, getAccessCookieOptions())
    .cookie('refresh_token', refreshToken, getRefreshCookieOptions())
    .status(200).send();
}

async function logout(_req: Request, res: Response) {
  res
  .clearCookie('access_token')
  .clearCookie('refresh_token')
  .status(200)
  .send();
}

export default {
  login,
  refreshToken,
  logout
};