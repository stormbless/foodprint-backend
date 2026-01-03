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

//..................PRIVATE METHODS............

// get list of unique foods/dates in servings
function getUniqueProps(prop: string, servings: Serving[]): string[] {
  const uniqueProps: string[] = [];
  
  for (let serving of servings) {
    if (!uniqueProps.includes(serving[prop as keyof Serving] as string)) {
      uniqueProps.push(serving[prop as keyof Serving] as string);
    }
  }

  return uniqueProps;
}

// creates a serving impact object using food impact data and the amount in a serving
function createServingImpact(matchingFood: CronometerFoodImpact, servingAmount: number) {
  const servingImpact: ServingImpact = {
    food: matchingFood.name,
    amount: servingAmount,
    emissions: matchingFood.emissionsPerKg * (servingAmount / 1000),
    waterUse: matchingFood.waterUsePerKg * (servingAmount / 1000),
    landUse: matchingFood.landUsePerKg * (servingAmount / 1000),
    eutrophication: matchingFood.eutrophicationPerKg * (servingAmount / 1000)
  };

  return servingImpact;
}

// creates a food entry for a given user and date with all servings + env impact data (for each serving)
function createFoodEntry(userEmail: string, date: string, 
      servings: Serving[], foodImpacts: CronometerFoodImpact[]): FoodEntry {
  
  const foodEntry: FoodEntry = { userEmail: userEmail, date: new Date(date), servings: [] };

  // servings with same date grouped into same food entry
  for (let serving of servings) {
    if (serving.date === date) {
      // find food that matches serving food name and get impact data from it
      const matchingFood = foodImpacts.find(food => food.cronometerFoodName === serving.food);
      // if cronometer food name not in database (matching food would be undefined), don't add food's serving
      if (matchingFood !== undefined) {
        const servingImpact: ServingImpact = createServingImpact(matchingFood, serving.amount);

        foodEntry.servings.push(servingImpact);
      } 
    }
  }

  return foodEntry;
}



//..................PUBLIC METHODS............



// transform user's servings into food entries; which is basically servings grouped by date with impact metrics 
// This format is more usable for calculating diet env impact and is stored in mongoDB collection later
async function transformServingstoFoodEntries(userEmail: string, servings: Serving[]): Promise<FoodEntry[]> {
  const foodEntries: FoodEntry[] = [];
  
  const uniqueFoods: string[] = getUniqueProps("food", servings);

  try {
    // get impact metrics for each unique cronometer food
    const foodImpacts: CronometerFoodImpact[] = await FoodModel.getCronometerFoodsImpact(uniqueFoods);

    const uniqueDates: string[] = getUniqueProps("date", servings);
  
    // create food entry for each unique date
    for (let date of uniqueDates) {
      const foodEntry: FoodEntry = createFoodEntry(userEmail, date, servings, foodImpacts);
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