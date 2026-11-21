import { MongoClient } from "mongodb";
let client = null;
let database = null;
export async function connectDB() {
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
