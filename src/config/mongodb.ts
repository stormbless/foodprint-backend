import { MongoClient } from 'mongodb';

const connectionUrl: string = process.env.MONGO_CONNECTION_URL as string;
const client = new MongoClient(connectionUrl);

export default client;