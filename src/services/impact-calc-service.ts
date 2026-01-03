import AVERAGE_DIET_IMPACT from "../constants/average-diet-impact.js"

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

interface DateImpact {
  date: Date
  emissions: number,
  waterUse: number,
  landUse: number,
  eutrophication: number
  total: number
}

interface Impact {
  emissions: number,
  waterUse: number,
  landUse: number,
  eutrophication: number,
  total: number
}

interface FoodImpact {
  food: string,
  amount: number
  emissions: number,
  waterUse: number,
  landUse: number,
  eutrophication: number,
  totalImpact: number
}

// calculate total impact relative to average diet (includes all metrics)
function calcRelativeTotalImpact(emissions: number, waterUse: number, landUse: number, eutrophication: number): number {
  // weight each metric equally (25% of relative impact each)
  const relativeEmissions = 0.25 * emissions / AVERAGE_DIET_IMPACT.emissionsPerDay;
  const relativeWaterUse = 0.25 * waterUse / AVERAGE_DIET_IMPACT.waterUsePerDay;
  const relativeLandUse = 0.25 * landUse / AVERAGE_DIET_IMPACT.landUsePerDay;
  const relativeEutrophication = 0.25 * eutrophication / AVERAGE_DIET_IMPACT.eutrophicationPerDay;
    
  const relativeImpact = relativeEmissions + relativeWaterUse + relativeLandUse + relativeEutrophication;

  return relativeImpact;
}

// calculates impact over time for each env metric using user's food entries
// takes an array of foodEntries and
// returns an array of date impact objects 
function calcImpactOverTime(foodEntries: FoodEntry[]): DateImpact[] {
  // for each foodEntry (each has unique date)
  // create impact object with properties: date, emissions, waterUse, landUse and eutrophication
  const impactOverTime: DateImpact[] = foodEntries.map((foodEntry) => {
    let emissions = 0;
    let waterUse = 0;
    let landUse = 0;
    let eutrophication = 0;

    // sum env metrics for each food entered on the date
    for (let serving of foodEntry.servings) {
      emissions += serving.emissions;
      waterUse += serving.waterUse;
      landUse += serving.landUse;
      eutrophication += serving.eutrophication;
    }
    return {
      date: foodEntry.date,
      emissions,
      waterUse,
      landUse,
      eutrophication,
      total: calcRelativeTotalImpact(emissions, waterUse, landUse, eutrophication)
    }
  })
  
  return impactOverTime;

}

// calculates total impact for each env metric using user's food entries
// takes an array of foodEntries and
// returns an impact object
function calcTotalImpact(foodEntries: FoodEntry[]): Impact {
  let emissionsTotal = 0;
  let waterUseTotal = 0;
  let landUseTotal = 0;
  let eutrophicationTotal = 0;
    
  // sum env metrics for every food entry
  for (let foodEntry of foodEntries) {
    for (let serving of foodEntry.servings) {
      emissionsTotal += serving.emissions;
      waterUseTotal += serving.waterUse;
      landUseTotal += serving.landUse;
      eutrophicationTotal += serving.eutrophication;
    }
  }

  const total = calcRelativeTotalImpact(emissionsTotal, waterUseTotal, landUseTotal, eutrophicationTotal);

  const totalImpact = {
    emissions: emissionsTotal,
    waterUse: waterUseTotal,
    landUse: landUseTotal,
    eutrophication: eutrophicationTotal,
    total
  };

  return totalImpact;
}

// calculates avg diet impact for a given number of days (e.g. avg impact for 1 week would be 7)
// takes a number of days
// returns a impact object
function calcAvgImpact(days: number): Impact {
  const avgEmissions = days * AVERAGE_DIET_IMPACT.emissionsPerDay
  const avgWaterUse = days * AVERAGE_DIET_IMPACT.waterUsePerDay
  const avgLandUse = days * AVERAGE_DIET_IMPACT.landUsePerDay
  const avgEutrophication = days * AVERAGE_DIET_IMPACT.eutrophicationPerDay
  
  const avgImpact = {
    emissions: avgEmissions,
    waterUse: avgWaterUse,
    landUse: avgLandUse,
    eutrophication: avgEutrophication,
    // total env impact units are avg days (value of 1 = 1 day's impact for an average diet)
    // so total impact for average diet for a number of days is just the number of days
    total: days
  };

  return avgImpact;
}

// calculates the percentage of the total impact in terms of the average impact for each env metric + total
function calcPercentageOfAvg(totalImpact: Impact, avgImpact: Impact): Impact {
  return {
    emissions: +((totalImpact.emissions / avgImpact.emissions) * 100).toFixed(1),
    waterUse:  +((totalImpact.waterUse / avgImpact.waterUse) * 100).toFixed(1),
    landUse:  +((totalImpact.landUse / avgImpact.landUse) * 100).toFixed(1),
    eutrophication:  +((totalImpact.eutrophication / avgImpact.eutrophication) * 100).toFixed(1),
    total: +((totalImpact.total / avgImpact.total) * 100).toFixed(1)
  };
}

// calculate impact (all metrics + total) for a single food using food entries
function calcFoodImpact(targetFood: string, foodEntries: FoodEntry[]): FoodImpact {
  let amount = 0;
  let emissions = 0;
  let waterUse = 0;
  let landUse = 0;
  let eutrophication = 0;
    
  // sum amount (g) and env metrics for every foodEntry of targetFood
  for (let foodEntry of foodEntries) {
    for (let serving of foodEntry.servings) {
      if (serving.food === targetFood) {
        amount += serving.amount
        emissions += serving.emissions;
        waterUse += serving.waterUse;
        landUse += serving.landUse;
        eutrophication += serving.eutrophication;
      }
    }
  }

  const totalImpact = calcRelativeTotalImpact(emissions, waterUse, landUse, eutrophication);

  const foodImpact: FoodImpact = {
    food: targetFood,
    amount,
    emissions,
    waterUse,
    landUse,
    eutrophication,
    totalImpact
  };

  return foodImpact;
}

// calculate impact (all metrics + total) for all foods in food entries
function calcFoodImpacts(foodEntries: FoodEntry[]): FoodImpact[] {
  // get list of unique foods in foodEntries
  const uniqueFoods: string[] = [];

  for (let foodEntry of foodEntries) {
    for (let serving of foodEntry.servings)
      if (!uniqueFoods.includes(serving.food)) {
        uniqueFoods.push(serving.food);
      }
  }

  const foodImpacts: FoodImpact[] = [];
    
  // calc impact for every unique food and add to foodImpacts
  for (let uniqueFood of uniqueFoods) {
    const foodImpact: FoodImpact = calcFoodImpact(uniqueFood, foodEntries);
    
    foodImpacts.push(foodImpact);
  }

  return foodImpacts;
}

export default {
  calcRelativeTotalImpact,
  calcImpactOverTime,
  calcTotalImpact,
  calcAvgImpact,
  calcPercentageOfAvg,
  calcFoodImpacts
};