import { getCollections } from "./collections.js";
export async function createIndexes() {
    const { users, tuitions, applications, payments } = await getCollections();
    // Users
    await users.createIndex({ email: 1 }, { unique: true });
    // Tuitions
    await tuitions.createIndex({ status: 1, createdAt: -1 });
    await tuitions.createIndex({ studentId: 1 });
    // Applications
    await applications.createIndex({ tuitionId: 1, tutorId: 1 }, { unique: true });
    await applications.createIndex({ tutorId: 1, status: 1 });
    await applications.createIndex({ studentId: 1, status: 1 });
    // Payments
    await payments.createIndex({ stripeSessionId: 1 }, { unique: true });
    await payments.createIndex({ userId: 1, createdAt: -1 });
    console.log("MongoDB indexes created successfully.");
}
