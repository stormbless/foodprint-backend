import FoodModel from "../models/FoodModel.js"

interface Serving {
  date: string,
  food: string,
  amount: number
}

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

interface CronometerFoodImpact {
  cronometerFoodName: string,
  name: string,
  emissionsPerKg: number,
  waterUsePerKg: number,
  landUsePerKg: number,
  eutrophicationPerKg: number
}

async function transformServingstoFoodEntries(userEmail: string, servings: Serving[]): Promise<FoodEntry[]> {
  const foodEntries: FoodEntry[] = [];
  
  // get list of unique foods in servings
  const uniqueFoods: string[] = [];
  
  for (let serving of servings) {
    if (!uniqueFoods.includes(serving.food)) {
      uniqueFoods.push(serving.food);
    }
  }

  try {
    // get impact metrics for each unique cronometer food
    const foodImpacts: CronometerFoodImpact[] = await FoodModel.getCronometerFoodsImpact(uniqueFoods);
    console.log(`typeof foodImpacts[0].emissionsPerKg: ${typeof foodImpacts[0]?.emissionsPerKg}`);

    // get list of unique dates in servings
    const uniqueDates: string[] = [];
    
    for (let serving of servings) {
      if (!uniqueDates.includes(serving.date)) {
        uniqueDates.push(serving.date);
      }
    }
  
    // for every unique date in servings, create a foodEntry object with userEmail, date, and list of foods (with impact metrics)
    for (let date of uniqueDates) {
      const foodEntry: FoodEntry = {userEmail: userEmail, date: new Date(date), servings: []};
  
      // group servings with same date into same food entry
      // for every food in servings with the date, create food object and add to foodEntry foods
      for (let serving of servings) {
        if (serving.date === date) {
          // find food that matches serving food name and get impact data from it
          const matchingFood = foodImpacts.find(food => food.cronometerFoodName === serving.food);
          // if cronometer food name not in database (matching food would be undefined), don't add food
          if (matchingFood !== undefined) {
            const servingImpact: ServingImpact = {
              food: matchingFood.name,
              amount: serving.amount,
              emissions: matchingFood.emissionsPerKg * (serving.amount / 1000),
              waterUse: matchingFood.waterUsePerKg * (serving.amount / 1000),
              landUse: matchingFood.landUsePerKg * (serving.amount / 1000),
              eutrophication: matchingFood.eutrophicationPerKg * (serving.amount / 1000)
            }
    
            foodEntry.servings.push(servingImpact);
          } 
        }
      }
      foodEntries.push(foodEntry);
  
    }
  
  } catch (error) {
    console.error(error);
  }
  return foodEntries;

}

export default {
  transformServingstoFoodEntries
};