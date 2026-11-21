
import type { Collection, Document } from "mongodb";
import { connectDB } from "./db.js";

export const COLLECTIONS = {
  USERS: "users",
  TUITIONS: "tuitions",
  APPLICATIONS: "applications",
  PAYMENTS: "payments",
} as const;

export async function getCollections() {
  const db = await connectDB();

  return {
    users: db.collection(COLLECTIONS.USERS),
    tuitions: db.collection(COLLECTIONS.TUITIONS),
    applications: db.collection(COLLECTIONS.APPLICATIONS),
    payments: db.collection(COLLECTIONS.PAYMENTS),
  };
}
