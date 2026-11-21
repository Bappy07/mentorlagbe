
import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "mentorlagbe";

  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables.");
  }

  if (database) {
    return database;
  }

  client = new MongoClient(uri);

  await client.connect();

  database = client.db(dbName);

  console.log(`MongoDB connected: ${dbName}`);

  return database;
}
