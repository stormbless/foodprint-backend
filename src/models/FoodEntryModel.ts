import type { Collection, Db, ObjectId, Filter, InsertManyResult, DeleteResult } from 'mongodb';
import client from '../config/mongodb.js'

const dbName: string = process.env.MONGO_DATABASE as string;

interface FoodEntry {
  _id?: ObjectId;
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

async function insertFoodEntries(foodEntries: FoodEntry[]): Promise<boolean> {
  try {
    await client.connect();
    
    const db: Db = client.db(dbName);
    const collection: Collection<FoodEntry> = db.collection<FoodEntry>('user_food_entries');
  
    const insertResult: InsertManyResult<FoodEntry> = await collection.insertMany(foodEntries);

    // insertResult.acknowledged is true when the insert is successful
    const isSuccessful: boolean = insertResult.acknowledged;

    return isSuccessful;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await client.close();
  }
}

// clears the user_food_entries table of user entries for a given user email
async function deleteFoodEntries(query: Filter<FoodEntry>): Promise<boolean> {
  try {
    await client.connect();
    
    const db: Db = client.db(dbName);
    const collection: Collection<FoodEntry> = db.collection<FoodEntry>('user_food_entries');
  
    const deleteResult: DeleteResult = await collection.deleteMany(query);

    // deleteResult.acknowledged is true when the delete is successful
    const isSuccessful: boolean = deleteResult.acknowledged;

    return isSuccessful;
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    await client.close();
  }
}

// gets all food entries for a given user email over a given date range
async function getFoodEntries(userEmail: string, startDate: string, endDate: string): Promise<FoodEntry[]> {
  const query: Filter<FoodEntry> = {
    $and: [
        { userEmail: userEmail },
        { date: { $gte: new Date(startDate) } },
        { date: { $lte: new Date(endDate) } }
    ]
  };
  
  try {
    await client.connect();
    
    const db: Db = client.db(dbName);
    const collection: Collection<FoodEntry> = db.collection<FoodEntry>('user_food_entries');
  
    const foodEntries = await collection.find(query).toArray();

    return foodEntries;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    await client.close();
  }
}

export default {
  insertFoodEntries,
  deleteFoodEntries,
  getFoodEntries
};