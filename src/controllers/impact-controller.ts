import type { Request, Response } from 'express';

import FoodEntryModel from '../models/FoodEntryModel.js';
import impactCalcService from '../services/impact-calc-service.js';

interface FoodEntry {
  userEmail: string,
  date: Date,
  servings: ServingImpact[]
}

interface ServingImpact {
  food: string,
  amount: number,
  emissions: number,
  waterUse: number,
  landUse: number,
  eutrophication: number
}

//..................PRIVATE METHODS............

function inputValid(startDate: string, endDate: string): boolean {
  // YYYY-MM-DD
  const validDate: RegExp = /^([0-9]{4})-(0[1-9]|1[0-2]|[1-9])-([1-9]|0[1-9]|[1-2]\d|3[0-1])$/;

  if (!startDate) {
    return false;
  }
  if (!validDate.test(startDate)) {
    return false;
  }

  if (!endDate) {
    return false;
  }
  if (!validDate.test(endDate)) {
    return false;
  }

  if (startDate <= endDate) {
    return false;
  }
  
  return true;
}

//..................PUBLIC METHODS............


async function getDashboardData(req: Request, res: Response) {
  try {
    const userEmail: string = req.userEmail as string;
    const startDate: string = req.query.startDate as string;
    const endDate: string = req.query.endDate as string;

    if (!inputValid(startDate, endDate)) {
      console.log('input invalid');
      return res.status(500).send('input invalid');
    }

    
    console.time('getFoodEntries');
    const foodEntries: FoodEntry[] = await FoodEntryModel.getFoodEntries(userEmail, startDate, endDate);
    console.timeEnd('getFoodEntries');

    if (foodEntries.length === 0 ) { return res.status(204).send(); }

    const impactSummary = impactCalcService.calcImpactSummary(foodEntries);
    const foodImpacts = impactCalcService.calcFoodImpacts(foodEntries);
    const impactOverTime = impactCalcService.calcImpactOverTime(foodEntries);

    const dashboardData = {
      impactSummary,
      foodImpacts,
      impactOverTime
    }

    return res.status(200).send(dashboardData);
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}

export default {
  getDashboardData
};