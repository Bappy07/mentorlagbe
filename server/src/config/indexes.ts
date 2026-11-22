
import { getCollections } from "./collections.js";

export async function createIndexes() {
  const { users, tuitions, applications, payments } =
    await getCollections();

  // Users
  await users.createIndex(
    { email: 1 },
    { unique: true }
  );

  // Tuitions
  await tuitions.createIndex({ status: 1, createdAt: -1 });
  await tuitions.createIndex({ tutorId: 1 });
  await tuitions.createIndex({ studentId: 1 });

  // Applications
  // Remove the old unique index (tuitionId + tutorId).
  const existingIndexes = await applications.indexes();

  const oldApplicationIndex = existingIndexes.find(
    (index) => index.name === "tuitionId_1_tutorId_1"
  );

  if (oldApplicationIndex) {
    await applications.dropIndex("tuitionId_1_tutorId_1");
  }

  // Prevent duplicate applications from the same student.
  // studentPhone excludes records created by the old workflow.
  await applications.createIndex(
    { tuitionId: 1, studentId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        studentPhone: { $type: "string" },
      },
    }
  );

  await applications.createIndex({ tutorId: 1, status: 1 });
  await applications.createIndex({ studentId: 1, status: 1 });

  // Payments
  await payments.createIndex(
    { stripeSessionId: 1 },
    { unique: true }
  );

  await payments.createIndex({ userId: 1, createdAt: -1 });

  console.log("MongoDB indexes created successfully.");
}
