// FoodModel (data access object for foods mysql table)

import type { RowDataPacket } from 'mysql2'
import connection from '../config/mysql.js'
import impactCalcService from '../services/impact-calc-service.js'

interface CronometerFoodImpact extends RowDataPacket {
  cronometerFoodName: string,
  name: string,
  emissionsPerKg: number,
  waterUsePerKg: number,
  landUsePerKg: number,
  eutrophicationPerKg: number
}

interface FoodImpact extends RowDataPacket {
  name: string,
  category: string,
  emissionsPerKg: number,
  waterUsePerKg: number,
  landUsePerKg: number,
  eutrophicationPerKg: number
}

interface FoodImpactPerKg extends FoodImpact {
  totalImpactPerKg: number
}


// takes a list of cronometer food names and returns an array of cronometer foods with
// cronometer food name, FoodPrint name, and env metrics per kg
async function getCronometerFoodsImpact(cronometerFoods: string[]): Promise<CronometerFoodImpact[]> {
  const queryString = `SELECT 
    cronometer_food_name AS cronometerFoodName, 
    name, 
    emissions AS emissionsPerKg, 
    water_use AS waterUsePerKg, 
    land_use AS landUsePerKg, 
    eutrophication AS eutrophicationPerKg
    from Food NATURAL JOIN Cronometer_Food_Mapping
    WHERE cronometer_food_name IN (?)`;
  
  const [cronometerFoodsImpact] = await connection.query<CronometerFoodImpact[]>(queryString, [cronometerFoods]); 

  return cronometerFoodsImpact;
}

// returns all foods with their impact per kg for individual metrics + total
async function getAllFoodsImpactPerKg(): Promise<FoodImpactPerKg[]> {
  const queryString = `SELECT 
    name, 
    category,
    emissions AS emissionsPerKg, 
    water_use AS waterUsePerKg, 
    land_use AS landUsePerKg, 
    eutrophication AS eutrophicationPerKg
    from Food`;

  const [foods] = await connection.query<FoodImpact[]>(queryString); 

  // calculate total impact peer kg for each food (relative to avg diet impact)
  const allFoodsImpact = foods.map((food) => {
    const totalImpactPerKg = impactCalcService.calcRelativeTotalImpact(
      food.emissionsPerKg, food.waterUsePerKg, food.landUsePerKg, food.eutrophicationPerKg
    );

    return { ...food, totalImpactPerKg };
  });

  return allFoodsImpact;
}

export default {
  getCronometerFoodsImpact,
  getAllFoodsImpactPerKg
};