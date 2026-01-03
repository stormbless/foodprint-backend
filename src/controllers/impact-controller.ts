import type { Request, Response } from 'express';

import FoodEntryModel from '../models/FoodEntryModel.js';
import impactCalcService from '../services/impact-calc-service.js';
import gradeService from '../services/grade-service.js';

//..................PRIVATE METHODS............

function inputValid(userEmail: string, startDate: string, endDate: string): boolean {
  const isEmail: RegExp = /^\S+@\S+\.\S+$/;
  // YYYY-MM-DD
  const validDate: RegExp = /^([0-9]{4})-(0[1-9]|1[0-2]|[1-9])-([1-9]|0[1-9]|[1-2]\d|3[0-1])$/;

  if (!userEmail) {
    return false;
  }
  if (!isEmail.test(userEmail)) {
    return false;
  }

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
  

  return true;
}

//..................PUBLIC METHODS............



async function getImpactSummary(req: Request, res: Response) {
  try {
    const userEmail: string = req.query.userEmail as string; 
    const startDate: string = req.query.startDate as string;
    const endDate: string = req.query.endDate as string;

    if (!inputValid(userEmail, startDate, endDate)) {
      console.log('input invalid');
      return res.status(500).send('input invalid');
    }
    console.time('getFoodEntries');
    const foodEntries = await FoodEntryModel.getFoodEntries(userEmail, startDate, endDate);
    console.timeEnd('getFoodEntries');

    if (foodEntries.length === 0 ) { return res.status(204).send(); }

    const totalImpact = impactCalcService.calcTotalImpact(foodEntries);
    const avgImpact = impactCalcService.calcAvgImpact(foodEntries.length);
    const percentageOfAvg = impactCalcService.calcPercentageOfAvg(totalImpact, avgImpact);
    const grades = gradeService.calcGrades(percentageOfAvg);

    const impactSummary = {
      totalImpact,
      avgImpact,
      percentageOfAvg,
      grades
    };

    return res.status(200).send(impactSummary);
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}

async function getFoodImpacts(req: Request, res: Response) {
  try {
    const userEmail: string = req.query.userEmail as string; 
    const startDate: string = req.query.startDate as string;
    const endDate: string = req.query.endDate as string;

    if (!inputValid(userEmail, startDate, endDate)) {
      console.log('input invalid');
      return res.status(500).send('input invalid');
    }
    console.time('getFoodEntries');
    const foodEntries = await FoodEntryModel.getFoodEntries(userEmail, startDate, endDate);
    console.timeEnd('getFoodEntries');

    if (foodEntries.length === 0 ) { return res.status(204).send(); }

    const foodImpacts = impactCalcService.calcFoodImpacts(foodEntries);

    return res.status(200).send(foodImpacts);
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}

async function getImpactOverTime(req: Request, res: Response) {
  try {
    const userEmail: string = req.query.userEmail as string; 
    const startDate: string = req.query.startDate as string;
    const endDate: string = req.query.endDate as string;

    if (!inputValid(userEmail, startDate, endDate)) {
      console.log('input invalid');
      return res.status(500).send('input invalid');
    }
    console.time('getFoodEntries');
    const foodEntries = await FoodEntryModel.getFoodEntries(userEmail, startDate, endDate);
    console.timeEnd('getFoodEntries');

    if (foodEntries.length === 0 ) { return res.status(204).send(); }

    const impactOverTime = impactCalcService.calcImpactOverTime(foodEntries);

    // send impact over time data => [{date, emissions, waterUse, landUse, eutrophication}, {...}, ...]
    return res.status(200).send(impactOverTime);
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}

export default {
  getImpactSummary,
  getFoodImpacts,
  getImpactOverTime
};